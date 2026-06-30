# cloudrun/bazi-engine/main.py v0.5.1
"""玄机算命 - 排盘引擎 (Flask)"""
from flask import Flask, jsonify, request
from paipan import calculate_bazi_standalone
from llm_client import generate_interpretation
import traceback
import logging
import time

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'bazi-engine', 'version': '0.5.1'}), 200


@app.route('/api/paipan', methods=['POST'])
def paipan():
    try:
        data = request.get_json() or {}
        birth = data.get('birth', '').strip()
        gender = data.get('gender', 'male')
        if not birth:
            return jsonify({'code': 400, 'msg': '缺少出生时间参数 birth', 'data': None}), 400
        if gender not in ('male', 'female'):
            return jsonify({'code': 400, 'msg': '性别参数无效', 'data': None}), 400
        logger.info(f'[排盘] birth={birth}, gender={gender}')
        result = calculate_bazi_standalone(birth, gender)
        logger.info(f'[排盘成功] dayMaster={result["dayMaster"]}')
        return jsonify({'code': 0, 'msg': 'ok', 'data': result}), 200
    except ValueError as e:
        logger.warning(f'[参数错误] {e}')
        return jsonify({'code': 400, 'msg': str(e), 'data': None}), 400
    except Exception as e:
        logger.error(f'[异常] {traceback.format_exc()}')
        return jsonify({'code': 500, 'msg': '服务器内部错误', 'data': None}), 500


@app.route('/api/interpret', methods=['POST'])
def interpret():
    t_start = time.time()
    try:
        data = request.get_json() or {}
        birth = data.get('birth', '').strip()
        gender = data.get('gender', 'male')
        paipan_result = data.get('paipan_result', None)

        if not birth:
            return jsonify({'code': 400, 'msg': '缺少出生时间参数 birth', 'data': None}), 400
        if gender not in ('male', 'female'):
            return jsonify({'code': 400, 'msg': '性别参数无效', 'data': None}), 400

        # 如果前端未传排盘结果，后端自行排盘
        if not paipan_result:
            logger.info(f'[解读] 未传入paipan_result，后端自行排盘 birth={birth}, gender={gender}')
            try:
                paipan_result = calculate_bazi_standalone(birth, gender)
                logger.info(f'[排盘成功] dayMaster={paipan_result.get("dayMaster", "unknown")}')
            except ValueError as e:
                logger.warning(f'[排盘参数错误] {e}')
                return jsonify({'code': 400, 'msg': str(e), 'data': None}), 400
        else:
            logger.info(f'[解读] 使用前端传入的排盘结果 dayMaster={paipan_result.get("dayMaster", "unknown")}')

        # 调用 LLM 生成解读
        logger.info(f'[解读] 开始调用LLM birth={birth}, gender={gender}')
        llm_result = generate_interpretation(paipan_result, birth, gender)

        cost_ms = int((time.time() - t_start) * 1000)

        if llm_result.get('success'):
            logger.info(f'[解读成功] model={llm_result.get("model")}, tokens={llm_result.get("tokens")}, cost_ms={cost_ms}')
            return jsonify({
                'code': 0,
                'msg': 'ok',
                'data': {
                    'interpretation': llm_result.get('interpretation'),
                    'model': llm_result.get('model'),
                    'tokens': llm_result.get('tokens'),
                    'fallback': False,
                    'paipan_result': paipan_result,
                    'cost_ms': cost_ms
                }
            }), 200
        else:
            logger.warning(f'[解读降级] LLM不可用, error={llm_result.get("error")}, cost_ms={cost_ms}')
            return jsonify({
                'code': 0,
                'msg': 'LLM暂不可用，返回排盘裸数据',
                'data': {
                    'interpretation': None,
                    'fallback': True,
                    'paipan_result': paipan_result,
                    'cost_ms': cost_ms
                }
            }), 200

    except Exception as e:
        cost_ms = int((time.time() - t_start) * 1000)
        logger.error(f'[解读异常] {traceback.format_exc()}, cost_ms={cost_ms}')
        return jsonify({'code': 500, 'msg': '服务器内部错误', 'data': None}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
