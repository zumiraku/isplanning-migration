<{* =========================================================================
     営業日カレンダー — ct646（卓上カレンダー）専用

     🔴 GENERATED — tools/build-category-calendar.sh が生成します。
        ただし**毎月の更新はこのファイルを直接直してください。**
        元にした再現ページは月が固定なので、作り直すと古い月に戻ります。

     このカテゴリだけ、カテゴリ設定のフリースペースに独自の内容が入って
     いました。クリエイターモードにはフリースペースを出すタグがないため、
     モジュールとして持たせています。

     商品の表は持ってきていません。元は25商品を価格ごと手で書いた表で、
     価格改定や品切れのたびに実際と食い違います。カテゴリページ本体が
     $category.item.list で実際の商品を出すので、そちらが正確です。

     月が変わったら、下の <h3> と表を書き換えてください。休業日のセルに
     class="is-closed" を付けます。色だけで伝えないよう、休業日のセルには
     読み上げ用の文字も入れてあります。消さないでください。

     いま入っている月: 2か月分 / 休業日 26 日
   ========================================================================= *}>

<h2 class="h-section">営業日カレンダー</h2>
  <div class="calgrid">
    <aside class="calendar">
      <h3>2026年8月</h3>
      <table>
        <thead><tr><th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th></tr></thead>
        <tbody>
          <tr><td></td><td></td><td></td><td></td><td></td><td></td><td class="is-closed">1<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">2<span class="visually-hidden">休業日</span></td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td class="is-closed">8<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">9<span class="visually-hidden">休業日</span></td><td class="is-closed">10<span class="visually-hidden">休業日</span></td><td class="is-closed">11<span class="visually-hidden">休業日</span></td><td class="is-closed">12<span class="visually-hidden">休業日</span></td><td class="is-closed">13<span class="visually-hidden">休業日</span></td><td class="is-closed">14<span class="visually-hidden">休業日</span></td><td class="is-closed">15<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">16<span class="visually-hidden">休業日</span></td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td><td class="is-closed">22<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">23<span class="visually-hidden">休業日</span></td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td class="is-closed">29<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">30<span class="visually-hidden">休業日</span></td><td>31</td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
      </table>
      <p class="calendar__key"><span><i></i>休業日（ご注文は24時間受付）</span></p>
    </aside>
    <aside class="calendar">
      <h3>2026年9月</h3>
      <table>
        <thead><tr><th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th></tr></thead>
        <tbody>
          <tr><td></td><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td class="is-closed">5<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">6<span class="visually-hidden">休業日</span></td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td class="is-closed">12<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">13<span class="visually-hidden">休業日</span></td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td class="is-closed">19<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">20<span class="visually-hidden">休業日</span></td><td class="is-closed">21<span class="visually-hidden">休業日</span></td><td class="is-closed">22<span class="visually-hidden">休業日</span></td><td class="is-closed">23<span class="visually-hidden">休業日</span></td><td>24</td><td>25</td><td class="is-closed">26<span class="visually-hidden">休業日</span></td></tr>
          <tr><td class="is-closed">27<span class="visually-hidden">休業日</span></td><td>28</td><td>29</td><td>30</td><td></td><td></td><td></td></tr>
        </tbody>
      </table>
      <p class="calendar__key"><span><i></i>休業日（ご注文は24時間受付）</span></p>
    </aside>
  </div>

<{* 凡例。色だけで休業日を示すと、色の見分けがつかない方に伝わりません。 *}>
<p class="calendar__key"><i></i>色の付いた日は休業日です</p>
