"""気象庁の潮位表(推算値)を取り込み、サイト用のJSONに変換する。

GitHub Actions から毎月1回動かす想定(手元のPCで動かしてもよい)。
出力:
  data/tide/stations.json          … [[記号, 地点名, 緯度, 経度], ...]
  data/tide/{記号}/{YYYY-MM}.json   … {"01": {"h":[0〜23時の潮位cm], "hi":[["HH:MM",cm],...], "lo":[...]}, ...}

使うデータ(気象庁ホームページ、出典を明記して利用できる):
  地点一覧   https://www.data.jma.go.jp/gmd/kaiyou/db/tide/suisan/station{年}.php
  潮位表     https://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt/{年}/{記号}.txt
"""
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "tide")
UA = {"User-Agent": "eging-navi tide fetcher (personal, non-commercial)"}


def get(url, enc="utf-8"):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode(enc, errors="replace")


def stations(year):
    """地点一覧ページから 記号・名前・緯度経度 を読む。その年のページが無ければ前の年。"""
    pat = re.compile(
        r"<td>\s*\d+\s*</td>\s*<td>\s*([A-Z0-9]{2})\s*</td>\s*<td>\s*(.+?)\s*</td>\s*"
        r"<td>\s*(\d+)\s*[゜°]\s*(\d+)\s*['′]\s*</td>\s*<td>\s*(\d+)\s*[゜°]\s*(\d+)\s*['′]\s*</td>",
        re.S,
    )
    for y in (year, year - 1, year - 2):
        try:
            html = get(f"https://www.data.jma.go.jp/gmd/kaiyou/db/tide/suisan/station{y}.php")
        except Exception as e:  # noqa: BLE001
            print(f"station{y}.php: {e}", file=sys.stderr)
            continue
        out = []
        for code, name, la_d, la_m, lo_d, lo_m in pat.findall(html):
            name = re.sub(r"<[^>]+>", "", name).strip()
            out.append([code, name, round(int(la_d) + int(la_m) / 60, 4), round(int(lo_d) + int(lo_m) / 60, 4)])
        if out:
            return out
    raise SystemExit("地点一覧を読めませんでした")


def parse_txt(text):
    """潮位表テキスト(1行136文字)を日ごとの辞書にする。"""
    days = {}
    for line in text.splitlines():
        if len(line) < 136:
            continue
        try:
            h = [int(line[i * 3:(i + 1) * 3]) for i in range(24)]
            yy, mm, dd = int(line[72:74]), int(line[74:76]), int(line[76:78])
        except ValueError:
            continue

        def events(start):
            ev = []
            for k in range(4):
                s = line[start + k * 7:start + k * 7 + 7]
                t, c = s[:4], s[4:]
                if t.strip() in ("9999", "") or c.strip() in ("999", ""):
                    continue
                t = t.replace(" ", "0")
                ev.append([f"{t[:2]}:{t[2:]}", int(c)])
            return ev

        key = (2000 + yy, mm)
        days.setdefault(key, {})[f"{dd:02d}"] = {"h": h, "hi": events(80), "lo": events(108)}
    return days


def ports():
    """漁港データも一緒に更新する(失敗しても潮位表の更新は続ける)"""
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import fetch_ports
        fetch_ports.main()
    except Exception as e:  # noqa: BLE001
        print("漁港データの更新に失敗:", e, file=sys.stderr)


def main():
    ports()
    today = dt.date.today()
    # 去年の分も入れておく(過去の釣果に潮を付けるため)。11月からは来年の分も
    years = [today.year - 1, today.year] + ([today.year + 1] if today.month >= 11 else [])
    st = stations(today.year)
    os.makedirs(ROOT, exist_ok=True)
    with open(os.path.join(ROOT, "stations.json"), "w", encoding="utf-8") as f:
        json.dump(st, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(st)} stations")
    ok = 0
    for code, name, *_ in st:
        for y in years:
            try:
                text = get(f"https://www.data.jma.go.jp/kaiyou/data/db/tide/suisan/txt/{y}/{code}.txt")
            except Exception as e:  # noqa: BLE001
                print(f"{code} {y}: {e}", file=sys.stderr)
                continue
            d = os.path.join(ROOT, code)
            os.makedirs(d, exist_ok=True)
            for (yy, mm), days in parse_txt(text).items():
                with open(os.path.join(d, f"{yy}-{mm:02d}.json"), "w", encoding="utf-8") as f:
                    json.dump(days, f, separators=(",", ":"))
            ok += 1
            time.sleep(0.5)  # 気象庁のサーバーに負担をかけない
    print(f"{ok} files")
    if ok == 0:
        raise SystemExit("潮位表を1つも取得できませんでした")


if __name__ == "__main__":
    main()
