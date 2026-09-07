<{* ==========================================================================
     買い物カゴ — Creator Mode（本文部分）

     C21 の [BASKET_MAIL] がここに関わります。ベーシックモードでは、この
     ページの「見積もりを依頼」が basket_mail() を呼び、tempid（カゴの
     セッション）を hidden で /ssl/contact/ に POST していました。tempid が
     載っているからこそ、届いた見積依頼が「何が入っていたカゴか」を知って
     いたわけです。

     クリエイターモードには $cart.estimate_url があり、$cart.is_estimate_enabled
     で有効かどうかを判定できます。ただしこれは「商品見積書」機能のもので、
     山口様からは「オプション（有料）のため使用していない」とご回答済み
     （C2）。つまり **この導線は現状そのままでは存在しません**。

     なので、かご内の見積依頼はマルチフォームへのリンクとして置いています。
     カゴの中身は引き継げませんが、リンクだけは残ります。tempid 相当の
     引き継ぎができるかは、実機で確認しないと分かりません。
   ========================================================================== *}>

<h1 class="h-page">買い物かご</h1>

<{if $cart.has_item}>

  <{if $cart.is_free_shipping_enabled}>
    <p class="notice"><{$cart.free_shipping_message}></p>
  <{/if}>

  <div class="table-scroll">
    <table class="carttable">
      <thead>
        <tr><th>商品</th><th>単価</th><th>数量</th><th>小計</th><th></th></tr>
      </thead>
      <tbody>
        <{section name=i loop=$cart.list}>
        <tr>
          <td class="carttable__name">
            <a href="<{$cart.list[i].url}>">
              <img class="carttable__media" src="<{$cart.list[i].image_M}>" alt="" loading="lazy">
              <{$cart.list[i].name}>
            </a>
            <span class="carttable__code"><{$cart.list[i].system_code}></span>
            <{if $cart.list[i].selected_option.has_item}>
              <span class="carttable__opt"><{$cart.list[i].special_display}></span>
            <{/if}>
            <{if $cart.list[i].is_bulk}>
              <a class="carttable__opt" href="<{$cart.list[i].bulk_url}>"><{$cart.list[i].bulk_name}></a>
            <{/if}>
          </td>
          <td class="carttable__price"><{$cart.list[i].price}></td>
          <td class="carttable__qty">
            <label class="visually-hidden" for="<{$cart.list[i].quantity_id}>">数量</label>
            <input class="qtyfield" type="number" min="1" id="<{$cart.list[i].quantity_id}>" value="<{$cart.list[i].quantity}>">
            <a href="<{$cart.list[i].quantity_url}>">変更</a>
          </td>
          <td class="carttable__price"><{$cart.list[i].total_price}></td>
          <td><a href="<{$cart.list[i].remove_url}>">削除</a></td>
        </tr>
        <{/section}>
      </tbody>
    </table>
  </div>

  <{if $cart.bulk.has_item}>
    <div class="notice">
      <{section name=b loop=$cart.bulk.list}>
        <p><{$cart.bulk.list[b].name}>：<{$cart.bulk.list[b].discount_price}> 割引</p>
      <{/section}>
    </div>
  <{/if}>

  <div class="cartsum">
    <div class="cartsum__row"><span>商品点数</span><span><{$cart.total_quantity}> 点</span></div>
    <div class="cartsum__row"><span>消費税</span><span><{$cart.total_tax}></span></div>
    <div class="cartsum__total"><span>合計</span><span><{$cart.total_price}></span></div>
    <p class="cartsum__note">送料は個数・種類に関係なく1回のご注文での料金です。離島・北海道・沖縄は別途送料、中継料が必要です（カゴでは自動計算されません）。</p>
  </div>

  <ul class="cartactions">
    <li><a class="btn btn--primary" href="<{$cart.order_url}>">ご注文手続きへ進む</a></li>
    <li><a class="btn btn--ghost" href="<{$url.top}>">買い物を続ける</a></li>
  </ul>

  <{* 見積依頼。この店舗ではカゴよりこちらからの注文が多い、と山口様。 *}>
  <div class="cartquote">
    <h2 class="h-sub">お見積もりをご希望の場合</h2>
    <p>数量の変更、名入れ・包装・のしのご相談は、見積依頼フォームからお願いいたします。</p>
    <{if $cart.is_estimate_enabled}>
      <a class="btn btn--ghost" href="<{$cart.estimate_url}>">見積書を発行する</a>
    <{/if}>
    <a class="btn btn--primary" href="/shop/enq202208200" target="_blank" rel="noopener">見積依頼フォーム</a>
  </div>

<{else}>
  <{* 空のカゴは行き止まりにしない。 *}>
  <p class="carttable__empty">買い物かごに商品が入っていません。</p>
  <p class="u-center">
    <a class="btn btn--primary" href="<{$url.top}>">粗品・景品をさがす</a>
  </p>
  <{* 見出しは中身がある場合だけ。空のカゴでローカル描画したところ、
       「最近チェックした商品」の見出しだけが出て下に何も無い状態でした。
       初めて来た人のカゴが空のとき、まさにその状態になります。 *}>
  <{if $recently_item.has_item}>
    <h2 class="h-section" style="margin-top:var(--s-12)">最近チェックした商品</h2>
    <ul class="rail">
      <{section name=r loop=$recently_item.list}>
        <li class="card">
          <a href="<{$recently_item.list[r].url}>">
            <div class="card__media"><img src="<{$recently_item.list[r].image_M}>" alt="<{$recently_item.list[r].name}>" loading="lazy"></div>
            <div class="card__body">
              <span class="card__name"><{$recently_item.list[r].name}></span>
              <span class="card__price"><{$recently_item.list[r].price}>円<small>（税込）</small></span>
            </div>
          </a>
        </li>
      <{/section}>
    </ul>
  <{/if}>
<{/if}>
