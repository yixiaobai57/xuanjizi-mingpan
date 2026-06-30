# cloudrun/bazi-engine/main.py v0.2.0
"""玄机算命 - 排盘引擎 (Flask)"""
from flask import Flask, jsonify, request
from paipan import calculate_bazi
import traceback
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health', methods=['GET'])
def health():
    """健康检查端点"""
    return jsonify({
        'status': 'ok',
        'service': 'bazi-engine',
        'version': '0.2.0'
    }), 200


@app.route('/api/paipan', methods=['POST'])
def paipan():
    """八字排盘接口"""
    try:
        data = request.get_json() or {}
        birth = data.get('birth', '').strip()
        gender = data.get('gender', 'male')

        if not birth:
            return jsonify({'code': 400, 'msg': '缺少出生时间参数 birth', 'data': None}), 400

        if gender not in ('male', 'female'):
            return jsonify({'code': 400, 'msg': '性别参数无效，须为 male 或 female', 'data': None}), 400

        logger.info(f'[排盘] birth={birth}, gender={gender}')

        result = calculate_bazi(birth, gender)

        logger.info(f'[排盘成功] dayMaster={result["dayMaster"]}')

        return jsonify({
            'code': 0,
            'msg': 'ok',
            'data': result
        }), 200

    except ValueError as e:
        logger.warning(f'[排盘参数错误] {e}')
        return jsonify({'code': 400, 'msg': str(e), 'data': None}), 400
    except Exception as e:
        logger.error(f'[排盘异常] {traceback.format_exc()}')
        return jsonify({'code': 500, 'msg': f'服务器内部错误: {str(e)}', 'data': None}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
