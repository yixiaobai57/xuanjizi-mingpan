# cloudrun/bazi-engine/llm_client.py v0.5.0
"""LLM 客户端 - AI 解读生成"""
import os
import json
import logging
import requests

logger = logging.getLogger(__name__)

# LLM 配置（从环境变量读取，支持多云厂商切换）
LLM_CONFIG = {
    'default': 'hunyuan',
    'models': {
        'hunyuan': {
            'api_url': os.getenv('HUNYUAN_API_URL', 'https://hunyuan.tencentcloudapi.com'),
            'api_key': os.getenv('HUNYUAN_API_KEY', ''),
            'secret_id': os.getenv('HUNYUAN_SECRET_ID', ''),
            'secret_key': os.getenv('HUNYUAN_SECRET_KEY', ''),
            'model': 'hunyuan-standard',
            'max_tokens': 1024,
            'temperature': 0.7
        }
    },
    'retry': {
        'max_retries': 2,
        'backoff_seconds': 2
    }
}

# Prompt 模板缓存
_PROMPT_CACHE = {}


def load_prompt_template(template_name='basic') -> str:
    """加载 prompt 模板"""
    if template_name in _PROMPT_CACHE:
        return _PROMPT_CACHE[template_name]

    template_path = os.path.join(os.path.dirname(__file__), 'prompt_templates', f'{template_name}.yaml')
    try:
        import yaml
        with open(template_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
            template = config.get('template', '')
            _PROMPT_CACHE[template_name] = template
            return template
    except FileNotFoundError:
        logger.error(f'Prompt模板不存在: {template_path}')
        return _get_fallback_prompt()
    except Exception as e:
        logger.error(f'加载Prompt模板失败: {e}')
        return _get_fallback_prompt()


def _get_fallback_prompt() -> str:
    """兜底 prompt"""
    return """你是一位精通八字命理的传统玄学师傅，请基于以下八字排盘结果，为用户生成一段300-500字的白话解读。
八字：{bazi_summary}
十神：{shi_shen}
日主：{day_master}
大运：{da_yun}
要求：概括性格、分析五行强弱、给1条生活建议，不要用绝对化断语。"""


def build_prompt(paipan_result: dict, birth: str, gender: str) -> str:
    """构建 LLM prompt"""
    template = load_prompt_template('basic')

    bazi = paipan_result.get('bazi', {})
    bazi_parts = []
    for pillar_name, pillar_label in [('year','年'),('month','月'),('day','日'),('hour','时')]:
        p = bazi.get(pillar_name, {})
        bazi_parts.append(f"{pillar_label}柱：{p.get('gan','')}{p.get('zhi','')}")

    bazi_summary = ' '.join(bazi_parts)
    shi_shen = ' '.join(paipan_result.get('shiShen', []))
    da_yun_info = paipan_result.get('daYun', {})
    da_yun_str = f"{da_yun_info.get('startAge',0)}岁起运，当前大运{da_yun_info.get('current','')}"

    prompt = template.format(
        bazi_summary=bazi_summary,
        bazi_year=f"{bazi.get('year',{}).get('gan','')}{bazi.get('year',{}).get('zhi','')}",
        bazi_month=f"{bazi.get('month',{}).get('gan','')}{bazi.get('month',{}).get('zhi','')}",
        bazi_day=f"{bazi.get('day',{}).get('gan','')}{bazi.get('day',{}).get('zhi','')}",
        bazi_hour=f"{bazi.get('hour',{}).get('gan','')}{bazi.get('hour',{}).get('zhi','')}",
        shi_shen=shi_shen,
        day_master=paipan_result.get('dayMaster', ''),
        da_yun=da_yun_str,
        birth=birth,
        gender='男' if gender == 'male' else '女'
    )
    return prompt


def generate_interpretation(paipan_result: dict, birth: str, gender: str) -> dict:
    """生成 AI 解读"""
    prompt = build_prompt(paipan_result, birth, gender)
    model_config = LLM_CONFIG['models'].get(LLM_CONFIG['default'], {})

    for attempt in range(LLM_CONFIG['retry']['max_retries'] + 1):
        try:
            response = _call_llm_api(model_config, prompt)

            if response and response.get('choices'):
                text = response['choices'][0].get('message', {}).get('content', '')
                return {
                    'success': True,
                    'interpretation': text,
                    'model': model_config.get('model', 'unknown'),
                    'tokens': response.get('usage', {}).get('total_tokens', 0)
                }
        except Exception as e:
            logger.warning(f'LLM调用失败 (attempt {attempt+1}/{LLM_CONFIG["retry"]["max_retries"]+1}): {e}')
            if attempt < LLM_CONFIG['retry']['max_retries']:
                import time
                time.sleep(LLM_CONFIG['retry']['backoff_seconds'] * (attempt + 1))
            continue

    logger.error('LLM调用全部重试失败，返回降级结果')
    return {
        'success': False,
        'interpretation': None,
        'error': 'LLM服务暂不可用',
        'fallback': True
    }


def _call_llm_api(config: dict, prompt: str) -> dict:
    """调用 LLM API（腾讯混元 OpenAI 兼容接口）"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {config.get("api_key", "")}'
    }
    payload = {
        'model': config.get('model', 'hunyuan-standard'),
        'messages': [
            {'role': 'system', 'content': '你是一位精通传统八字命理的玄学师傅。'},
            {'role': 'user', 'content': prompt}
        ],
        'max_tokens': config.get('max_tokens', 1024),
        'temperature': config.get('temperature', 0.7)
    }
    resp = requests.post(config['api_url'], headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()
