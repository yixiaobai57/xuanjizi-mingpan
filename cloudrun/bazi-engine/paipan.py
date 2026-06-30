# cloudrun/bazi-engine/paipan.py v0.2.0
"""八字排盘核心引擎"""
from datetime import datetime
from utils import CANG_GAN, get_shi_shen, get_wu_xing_distribution


def calculate_bazi_standalone(birth_str: str, gender: str = 'male') -> dict:
    """
    独立排盘计算（不依赖 lunar-python 时使用传统算法）
    注意：此为标准简化实现，生产环境应切换 lunar-python 库
    """
    try:
        dt = datetime.strptime(birth_str.strip(), '%Y-%m-%d %H:%M')
    except ValueError:
        raise ValueError(f'日期格式错误: {birth_str}，正确格式为 YYYY-MM-DD HH:MM')

    year = dt.year
    month = dt.month
    day = dt.day
    hour = dt.hour

    # 天干地支计算（简化农历推算）
    base_year = 4  # 甲子年基准偏移
    year_idx = (year - base_year) % 60
    year_gan_idx = year_idx % 10
    year_zhi_idx = year_idx % 12
    year_gan = '甲乙丙丁戊己庚辛壬癸'[year_gan_idx]
    year_zhi = '子丑寅卯辰巳午未申酉戌亥'[year_zhi_idx]

    # 月柱（五虎遁：甲己之年丙作首，乙庚之年戊为头，丙辛之年寻庚上，丁壬之年壬寅顺，戊癸之年甲寅起）
    month1_gan_idx = ((year_gan_idx % 5) * 2 + 2) % 10  # 寅月天干
    month_gan_idx = (month1_gan_idx + month - 1) % 10
    month_zhi_idx = (month + 1) % 12  # 寅=2，0-based直接用于数组索引，月1→寅(index2)
    month_gan = '甲乙丙丁戊己庚辛壬癸'[month_gan_idx]
    month_zhi = '子丑寅卯辰巳午未申酉戌亥'[month_zhi_idx]

    # 日柱（简化计算：基于公历日期的日干支推算）
    days_from_base = (dt - datetime(1900, 1, 1)).days
    day_gan_idx = (days_from_base + 10) % 10
    day_zhi_idx = (days_from_base + 12) % 12
    day_gan = '甲乙丙丁戊己庚辛壬癸'[day_gan_idx]
    day_zhi = '子丑寅卯辰巳午未申酉戌亥'[day_zhi_idx]

    # 时柱
    hour_zhi_idx_local = (hour + 1) // 2 % 12
    hour_zhi = '子丑寅卯辰巳午未申酉戌亥'[hour_zhi_idx_local]
    hour_gan_idx = (day_gan_idx * 2 + hour_zhi_idx_local) % 10
    hour_gan = '甲乙丙丁戊己庚辛壬癸'[hour_gan_idx]

    bazi = {
        'year':  {'gan': year_gan, 'zhi': year_zhi, 'cangGan': CANG_GAN.get(year_zhi, [])},
        'month': {'gan': month_gan, 'zhi': month_zhi, 'cangGan': CANG_GAN.get(month_zhi, [])},
        'day':   {'gan': day_gan, 'zhi': day_zhi, 'cangGan': CANG_GAN.get(day_zhi, [])},
        'hour':  {'gan': hour_gan, 'zhi': hour_zhi, 'cangGan': CANG_GAN.get(hour_zhi, [])}
    }

    shi_shen = [
        get_shi_shen(day_gan, year_gan),
        get_shi_shen(day_gan, month_gan),
        get_shi_shen(day_gan, day_gan),
        get_shi_shen(day_gan, hour_gan)
    ]

    gan_wuxing_map = {'甲':'木','乙':'木','丙':'火','丁':'火','戊':'土','己':'土','庚':'金','辛':'金','壬':'水','癸':'水'}
    day_master = f"{day_gan}{gan_wuxing_map.get(day_gan, '')}"

    wu_xing = get_wu_xing_distribution(bazi)

    start_age = (year % 10) + 1 if year % 10 <= 4 else 11 - (year % 10)

    # 判断大运顺逆：阳年(甲丙戊庚壬)男/阴年(乙丁己辛癸)女 → 顺排，反之逆排
    yang_gan = set('甲丙戊庚壬')
    is_year_yang = year_gan in yang_gan
    is_male = gender == 'male'
    forward = (is_year_yang and is_male) or (not is_year_yang and not is_male)

    da_yun_seq = []
    for i in range(8):
        offset = i + 1 if forward else -(i + 1)
        g_idx = (month_gan_idx + offset) % 10
        z_idx = (month_zhi_idx + offset) % 12
        da_yun_seq.append(f"{'甲乙丙丁戊己庚辛壬癸'[g_idx]}{'子丑寅卯辰巳午未申酉戌亥'[z_idx]}")

    return {
        'bazi': bazi,
        'shiShen': shi_shen,
        'dayMaster': day_master,
        'wuXing': wu_xing,
        'daYun': {
            'startAge': start_age,
            'startDate': f'{year + start_age}-02-04',
            'seq': da_yun_seq,
            'current': da_yun_seq[0],
            'currentStart': f'{year + start_age}-02-04',
            'currentEnd': f'{year + start_age + 10}-02-03'
        }
    }
