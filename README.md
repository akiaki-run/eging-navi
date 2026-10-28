# 全国エギングナビ

地図で範囲を決めると、天気・風・潮と海岸線の形から、今日のエギングの一押しポイント・時間帯・投げる向きを出すサイトです。Claude を使わずに動きます。

- 天気・風・波:Open-Meteo(登録不要・無料)からページを開いたときに直接取得
- 潮:気象庁の潮位表を、GitHub の自動実行で毎月取り込み
- 地図:国土地理院の地図と航空写真
- 記録の保存:ログインしなければその端末の中、Google でログインすると Firebase(Google の無料サービス)に保存してスマホと PC で同期。仲間グループでのポイント共有もログイン時に使えます

---

## 1. GitHub に置いて公開する

リポジトリは**公開(Public)**で大丈夫です。中に入るのはプログラムと公開データだけで、釣果の記録などは Firebase 側に保存されます。

1. このフォルダ(`eging-navi`)を `ドキュメント\GitHub\` の中に置きます。
2. GitHub Desktop で「File → Add local repository」からこのフォルダを選び、「create a repository」を押します。
3. 「Publish repository」を押します。**「Keep this code private」のチェックは外します**。
   - ブラウザの「Upload files」は一度に100ファイルまでなので、GitHub Desktop を使ってください。
4. GitHub のリポジトリのページで「Settings → Pages」を開きます。
   - Source:「Deploy from a branch」
   - Branch:「main」「/ (root)」→「Save」
5. 数分待つと `https://あなたのユーザー名.github.io/eging-navi/` で開けるようになります。

## 2. 潮位表を取り込む(最初の1回だけ手で動かす)

`.github/workflows/tide.yml` が無い場合(Claude がPCに置いたときは、安全のためこのフォルダだけ書き込めないことがあります)は、先に次をしてください。

- GitHub のリポジトリのページで「Actions」タブ →「set up a workflow yourself」を押し、ファイル名を `tide.yml` にして、このフォルダの `setup/tide.yml` の中身をすべて貼り付けて「Commit changes」。
- そのあと GitHub Desktop で「Fetch origin」→「Pull origin」を押して、手元にも取り込みます。

続いて:

1. リポジトリの「Settings → Actions → General」を開き、いちばん下の「Workflow permissions」を「**Read and write permissions**」にして保存します。
2. 「Actions」タブ →「潮位表の更新」→「Run workflow」を押します。
3. 数分で `data/tide` に全国の潮位表が入ります。以後は毎月2日に自動で更新されます。

潮位表が入るまでは、潮名(大潮・中潮など)と日の出・日の入りだけを計算で出します。

## 3. ログインの準備(Firebase)

ログインしなくても使えます。スマホと PC で記録を同期したい、仲間とポイントを共有したいときに設定してください。無料プラン(Spark)のままで足ります。

1. <https://console.firebase.google.com/> を開き、Google アカウントでログインして「プロジェクトを作成」。名前は `eging-navi` など。Google アナリティクスはオフで構いません。
2. プロジェクトの画面で「</>(ウェブ)」のアイコンを押してアプリを登録します(ニックネームは何でもよい。Firebase Hosting のチェックは不要)。
3. 表示された `firebaseConfig = { ... }` の値を、このフォルダの `firebase-config.js` の `""` の中に貼り付けます(apiKey・authDomain・projectId・storageBucket・messagingSenderId・appId)。
4. 左のメニュー「構築 → Authentication」→「始める」→「Sign-in method」で「Google」を有効にして保存。
5. 同じ Authentication の「設定 → 承認済みドメイン」で「ドメインを追加」し、`あなたのユーザー名.github.io` を追加します。
6. 「構築 → Firestore Database」→「データベースを作成」。ロケーションは `asia-northeast1(東京)`、「本番環境モード」で作成。
7. Firestore の「ルール」タブを開き、中身をすべて消して、このフォルダの `firestore.rules` の中身を貼り付けて「公開」。
8. `firebase-config.js` を GitHub Desktop でコミットして Push。数分後にサイトの右上に「Googleでログイン」が出ます。

## 仲間に使ってもらう

- サイトの URL を送るだけで使えます。
- ポイントを共有したいときは、ページ下の「仲間とポイントを共有」でグループを作り、出てきたコード(英数字10文字)を仲間に送ります。仲間も Google でログインして、そのコードで参加します。
- 共有したいポイントのカードで「〇〇に共有」を押すと、そのグループの人の地図にだけ緑のピンで出ます。釣果の記録は共有されません。

## 費用と注意

- GitHub Pages・Firebase の無料プラン・Open-Meteo の範囲で動きます。Open-Meteo は非商用なら無料です(1日1万回まで)。仲間内で使う分には十分です。
- 天草の16か所以外のポイントは、海岸線の形から自動で出した候補です。道や立入禁止、足場は確認できていません。
- 海岸線は行政区域のデータなので、細い堤防までは入っていません。投げる向きは「その場所から見て海がどちらに開けているか」の目安です。

## ファイルの構成

| ファイル | 役割 |
|---|---|
| `index.html` | ページ本体 |
| `css/style.css` | 見た目 |
| `js/engine.js` | ポイント一覧と判断のルール(順位・時間帯・投げる向き) |
| `js/wx.js` | 天気・波・潮の取得 |
| `js/store.js` | 記録の保存(端末/Firebase)と仲間グループ |
| `js/app.js` | 地図と画面の動き |
| `firebase-config.js` | Firebase の設定値(手順3で貼る) |
| `firestore.rules` | Firebase のデータの鍵(手順3で貼る) |
| `data/land/` | 海岸線(p都道府県番号)と地名(t都道府県番号) |
| `data/tide/` | 潮位表(自動実行で作られる) |
| `scripts/fetch_tide.py` | 潮位表の取り込み |
| `.github/workflows/tide.yml` | 毎月の自動実行の設定 |

## データの出典

- 天気・風・波:[Open-Meteo](https://open-meteo.com/)(CC BY 4.0)
- 潮:[気象庁 潮位表](https://www.data.jma.go.jp/gmd/kaiyou/db/tide/suisan/)の推算値を加工
- 地図:[地理院タイル](https://maps.gsi.go.jp/development/ichiran.html)
- 海岸線:国土数値情報(行政区域データ)を加工
- 地名:Geolonia 住所データ
