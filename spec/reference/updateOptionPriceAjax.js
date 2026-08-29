function updateOptionPriceAjax(uid, callback){
    var id1 = '';
    var id2 = '';
    if(document.form1.brand_option){
        // 表形式のオプション
        if(document.form1.brand_option.length){
            var brand_option_length = document.form1.brand_option.length;
            for(var i=0; i<brand_option_length; i++){
                if(document.form1.brand_option[i].checked){
                    var tmp = String(document.form1.brand_option[i].value).split('_');
                    id1 = tmp[0];
                    id2 = tmp[1];
                    break;
                }
            }
        }else{
            if(document.form1.brand_option.checked){
                var tmp = String(document.form1.brand_option.value).split('_');
                id1 = tmp[0];
                id2 = tmp[1];
            }
        }
    }else{
        // プルダウン形式のオプション
        id1 = document.form1.spcode ? document.form1.spcode.value : '';
        if(String(id1) === '0'){
            return;
        }
        id2 = document.form1.spcode2 ? document.form1.spcode2.value : '';
        if(String(id2) === '0'){
            return;
        }
    }

    var xmlhttp = false;
    if(typeof ActiveXObject != "undefined"){
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {
            xmlhttp = false;
        }
    }
    if(!xmlhttp && typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
    }
    xmlhttp.open('POST', '/shop/shopdetail_option.html', true);
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            var option_stock = eval('(' + xmlhttp.responseText + ')');
            callback(option_stock);
        }
    }
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send('uid=' + uid + '&option1_id=' + id1 + '&option2_id=' + id2);
}

