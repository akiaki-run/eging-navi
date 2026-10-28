"""国土数値情報「漁港」データ(国土交通省)を取り込み、data/tide/ports.json に変換する。

fetch_tide.py の最後に呼ばれる(GitHub Actions の毎月の自動実行で動く)。
出力: [[漁港名, 緯度, 経度, 種別(0〜5)], ...]
  種別:0 不明 / 1 第1種 / 2 第2種 / 3 第3種 / 4 第4種 / 5 特定第3種

ダウンロードページ: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-C09.html
配布ファイルの形式(GML / Shapefile / GeoJSON)が変わっても読めるように、全部試す。
"""
import io
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "tide", "ports.json")
UA = {"User-Agent": "eging-navi port fetcher (personal, non-commercial)"}
BASE = "https://nlftp.mlit.go.jp/ksj/gml/"


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def zip_urls():
    """ダウンロードページから C09 の zip のリンクを集める。読めなければ決まった名前を試す。"""
    urls = []
    try:
        html = get(BASE + "datalist/KsjTmplt-C09.html").decode("utf-8", "replace")
        for href in re.findall(r"""['"]([^'"]*C09[^'"]*\.zip)['"]""", html):
            u = urllib.parse.urljoin(BASE + "datalist/KsjTmplt-C09.html", href)
            if u not in urls:
                urls.append(u)
    except Exception as e:  # noqa: BLE001
        print("ダウンロードページを読めません:", e, file=sys.stderr)
    if not urls:
        urls = [BASE + "data/C09/C09-06/C09-06_GML.zip"] + [BASE + f"data/C09/C09-06/C09-06_{p:02d}_GML.zip" for p in range(1, 48)]
    # 全国版があればそれだけ使う(都道府県版と重複するため)
    whole = [u for u in urls if not re.search(r"_\d{2}_", u)]
    return whole or urls


def parse_gml(data):
    out = []
    root = ET.fromstring(data)
    pts = {}
    for el in root.iter():
        if el.tag.endswith("}Point"):
            gid = el.get("{http://www.opengis.net/gml/3.2}id") or el.get("{http://www.opengis.net/gml}id") or el.get("id")
            pos = next((c.text for c in el.iter() if c.tag.endswith("}pos") and c.text), None)
            if gid and pos:
                a, b = pos.split()[:2]
                pts[gid] = (float(a), float(b))
    for el in root.iter():
        if not el.tag.endswith("}FishingPort"):
            continue
        name, typ, ll = "", 0, None
        for c in el:
            t = c.tag.split("}")[-1]
            if t == "fishingPortName":
                name = (c.text or "").strip()
            elif t == "type":
                try:
                    typ = int((c.text or "0").strip())
                except ValueError:
                    typ = 0
            elif t == "position":
                href = c.get("{http://www.w3.org/1999/xlink}href", "")
                if href.startswith("#") and href[1:] in pts:
                    ll = pts[href[1:]]
                else:
                    pos = next((x.text for x in c.iter() if x.tag.endswith("}pos") and x.text), None)
                    if pos:
                        a, b = pos.split()[:2]
                        ll = (float(a), float(b))
        if name and ll:
            out.append([name, ll[0], ll[1], typ])
    return out


def parse_geojson(data):
    out = []
    g = json.loads(data.decode("utf-8", "replace"))
    for f in g.get("features", []):
        geo = f.get("geometry") or {}
        if geo.get("type") != "Point":
            continue
        lng, lat = geo["coordinates"][:2]
        p = f.get("properties") or {}
        name = p.get("C09_003") or p.get("漁港名") or p.get("fishingPortName") or ""
        typ = p.get("C09_005") or p.get("種別") or 0
        if name:
            out.append([str(name), lat, lng, int(typ) if str(typ).isdigit() else 0])
    return out


def parse_shp(zf, base):
    try:
        import shapefile  # pyshp
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "pyshp"], check=False)
        import shapefile
    out = []
    shp = io.BytesIO(zf.read(base + ".shp"))
    dbf = io.BytesIO(zf.read(base + ".dbf"))
    for enc in ("cp932", "utf-8"):
        try:
            r = shapefile.Reader(shp=shp, dbf=dbf, encoding=enc)
            fields = [f[0] for f in r.fields[1:]]
            for sr in r.iterShapeRecords():
                if not sr.shape.points:
                    continue
                lng, lat = sr.shape.points[0][:2]
                rec = dict(zip(fields, sr.record))
                name = rec.get("C09_003") or next((v for v in rec.values() if isinstance(v, str) and v.endswith("漁港")), "")
                typ = rec.get("C09_005", 0)
                if name:
                    out.append([str(name), lat, lng, int(typ) if str(typ).isdigit() else 0])
            return out
        except Exception as e:  # noqa: BLE001
            print("Shapefile", base, enc, e, file=sys.stderr)
            shp.seek(0)
            dbf.seek(0)
    return out


def read_zip(blob):
    out = []
    zf = zipfile.ZipFile(io.BytesIO(blob))
    names = zf.namelist()
    gj = [n for n in names if n.lower().endswith(".geojson")]
    shp = [n[:-4] for n in names if n.lower().endswith(".shp") and n[:-4] + ".dbf" in names]
    xml = [n for n in names if n.lower().endswith(".xml") and "KS-META" not in n.upper()]
    for n in gj:
        out += parse_geojson(zf.read(n))
    if not out:
        for b in shp:
            out += parse_shp(zf, b)
    if not out:
        for n in xml:
            try:
                out += parse_gml(zf.read(n))
            except ET.ParseError as e:
                print("GML", n, e, file=sys.stderr)
    for n in names:  # zip の中の zip(都道府県別がまとめて入っている場合)
        if n.lower().endswith(".zip"):
            out += read_zip(zf.read(n))
    return out


def main():
    ports, seen = [], set()
    for u in zip_urls():
        try:
            blob = get(u)
        except Exception as e:  # noqa: BLE001
            print("取得できません", u, e, file=sys.stderr)
            continue
        got = read_zip(blob)
        print(u, len(got))
        for name, lat, lng, typ in got:
            if not (20 < lat < 46 and 122 < lng < 154):  # 緯度経度の順が逆なら入れ替える
                lat, lng = lng, lat
            key = (name, round(lat, 3), round(lng, 3))
            if key in seen:
                continue
            seen.add(key)
            ports.append([name, round(lat, 5), round(lng, 5), typ])
    if not ports:
        print("漁港データを読み込めませんでした", file=sys.stderr)
        return False
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(ports, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(ports)} ports")
    return True


if __name__ == "__main__":
    sys.exit(0 if main() else 1)
