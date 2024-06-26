
var kolGridSearchData = {};

window.addEventListener("DOMContentLoaded", (event) => {

    $(function () {
        $("#kkdTeslimIslemTarihi").datepicker();
    });

    const date1 = new Date();
    date1.setUTCDate(date1.getUTCDate());

    let day1 = date1.getDate();
    let month1 = date1.getMonth() + 1;
    if (month1 < 10) month1 = '0' + month1;
    let year1 = date1.getFullYear();

    document.getElementById('kkdTeslimIslemTarihi').value = `${day1}.${month1}.${year1}`;


    document.querySelector("#donanimTeslimForm").addEventListener("submit", function (event) {
        event.preventDefault();

        KddDonanimTalepList();

    });
    document.getElementById('kkdTeslimStatus').value = "5";
    KddDonanimTalepList();

});


document.getElementById('kkdTeslimReset').addEventListener('click', () => {


    document.getElementById('kkdTeslimIslemTarihi').value = "";
    document.getElementById('kkdTeslimStatus').value = "";
    document.getElementById('kkdTeslimSicilNo').value = "";
    document.getElementById('kkdTeslimSiciAdSoyad').value = "";
    KddDonanimTalepList();

});


async function KddDonanimTalepList() {

    var donanimTeslimMsg = document.querySelector(".donanimTeslimMsg");
    donanimTeslimMsg.innerHTML = "";
    donanimTeslimMsg.classList.add("d-none");

    var donanimTeslimTable = document.querySelector(".donanimTeslimTable");
    donanimTeslimTable.innerHTML = "";
    donanimTeslimTable.classList.add("d-none");

    var IslemDate = document.getElementById('kkdTeslimIslemTarihi').value;
    var Status = document.getElementById('kkdTeslimStatus').value;
    var SicilNo = document.getElementById('kkdTeslimSicilNo').value;
    var AdSoyad = document.getElementById('kkdTeslimSiciAdSoyad').value;

    kolGridSearchData = {
        Status: Status ? Status : null,
        IslemDate: IslemDate ? convertToISODate(IslemDate) : null,
        SicilNo: SicilNo ? SicilNo : null,
        AdSoyad: AdSoyad ? AdSoyad : null,
    };



    try {
        let url = '/kdd/PersonelTeslim/List/';

        let result = await asyncAjax(kolGridSearchData, url, 'POST');

        if (result.status) {

            KddDonanimTalepTable(result, donanimTeslimTable);

        } else {

            donanimTeslimMsg.classList.remove("d-none");
            showAlertMsg({ typeClass: 'alert-warning', msg: '' + result.errorMsg }, ".donanimTeslimMsg");


        }
    } catch (error) {

        donanimTeslimMsg.classList.remove("d-none");
        showAlertMsg({ typeClass: 'alert-danger', msg: '' + error.errorMsg || 'Sistem hatası' }, ".donanimTeslimMsg")
    }


}

function findItemByIdFromStokId(array, id) {
    const item = array.find(element => element.kddDonanimTypeSizeId == id);
    return item ? item.id : 0;
}



function findItemByIdFromStokMiktar(array, id) {
    const item = array.find(element => element.id == id);
    return item ? (item.miktar - item.kullanilan) : 0;
}

function findItemByTypeSizeIdFromStokMiktar(array, id) {
    const item = array.find(element => element.kddDonanimTypeSizeId == id);
    return item ? (item.miktar - item.kullanilan) : 0;
}


function KddDonanimTalepTable(result, donanimTeslimTable) {

    console.log(result);
    donanimTeslimTable.classList.remove("d-none");

    var table = null;
    var thead = null;
    var tbody = null;
    var tr = null;
    var th = null;
    var td = null;


    table = document.createElement('table');
    table.classList.add("table", "table-striped", "table-bordered", "table-hover", "table-sm", "kddDurumFontSize");

    thead = document.createElement('thead');

    tr = document.createElement('tr');
    tr.classList.add("table-info");

    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.innerHTML = "#";
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.innerHTML = "Personel";
    th.setAttribute("colspan", 2);
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.innerHTML = "Görevi";
    th.setAttribute("colspan", 2);
    tr.appendChild(th);


    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.innerHTML = "Donanım";
    th.setAttribute("colspan", 2);
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.innerHTML = "Stok";
    th.classList.add("text-center");
    tr.appendChild(th);



    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.classList.add("text-center");
    th.innerHTML = "Durum";
    tr.appendChild(th);




    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.classList.add("text-center");
    th.innerHTML = "İşlemler";
    th.setAttribute("colspan", 2);
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute("scope", "col");
    th.classList.add("text-center");
    th.innerHTML = "İşlem Tarihi";
    tr.appendChild(th);



    thead.appendChild(tr);
    table.appendChild(thead);

    tbody = document.createElement('tbody');
    tbody.classList.add("table-group-divider");

    var i = 1;
    for (const [rkey, rvalue] of Object.entries(result.result)) {


        var stok_miktari = 0;


        tr = document.createElement('tr');
        tr.classList.add("align-middle");

        th = document.createElement('th');
        th.setAttribute("scope", "row");
        th.innerHTML = i;
        tr.appendChild(th);

        td = document.createElement('td');
        td.innerHTML = rvalue["sicil"]["sicilno"];
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = rvalue["sicil"]["adisoyadi"];
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = rvalue["sicil"]["bolumadi"];
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = rvalue["ozluk"]["firmagorevi"];
        td.classList.add("kddTeslimTableBorder1");
        tr.appendChild(td);

        td = document.createElement('td');
        td.innerHTML = rvalue["donanim"]["name"];
        tr.appendChild(td);


        td = document.createElement('td');
        td.classList.add("text-center");

        var select = document.createElement('select');
        var option = null;

        select.classList.add("form-select", "kddSelectSize", "donanim-type-" + rvalue["kddDonanimId"]);


        if (rvalue["status"] == 2 || rvalue["status"] == 1) {
            select.setAttribute("disabled", "");
        }


        if (rvalue["donanim"].kddDonanimTypeSize.length > 0) {
            for (const [rkeyType, rvalueType] of Object.entries(rvalue["donanim"].kddDonanimTypeSize)) {


                var stockId = findItemByIdFromStokId(rvalue["donanim"].kddDonanimStock, rvalueType["id"]);

                option = document.createElement('option');
                option.setAttribute("value", rvalueType["id"]);
                option.innerHTML = rvalueType["name"];


                if (rvalue["kddDonanimStockId"] == stockId) {

                    stok_miktari = findItemByTypeSizeIdFromStokMiktar(rvalue["donanim"].kddDonanimStock, rvalueType["id"]);

                    option.setAttribute("selected", "selected");
                    select.value = rvalue["kddDonanimStockId"];
                }


                select.appendChild(option);
            }
        } else {


            option = document.createElement('option');
            option.setAttribute("value", "0");
            option.innerHTML = "-";

            stok_miktari = findItemByTypeSizeIdFromStokMiktar(rvalue["donanim"].kddDonanimStock, 0);

            select.appendChild(option);

        }

        var statusNo = rvalue["status"];

        if (rvalue["status"] == 2) {
            statusNo = 2;

        } else if (rvalue["status"] == 1) {
            statusNo = 1;

        } else if (rvalue["status"] == 0 && stok_miktari == 0) {
            statusNo = 3;

        } else if (rvalue["status"] == 0 && stok_miktari > 0) {
            statusNo = 0;
        }


        td.appendChild(select);


        tr.appendChild(td);


        td = document.createElement('td');
        td.classList.add("text-center", "kddTeslimTableBorder2");
        td.innerHTML = stok_miktari;

        tr.appendChild(td);



        td = document.createElement('td');
        td.classList.add("text-center", "fw-bold");

        var statusStr = "";


        if (statusNo == 2) {
            statusStr = "İPTAL EDİLDİ";
            td.classList.add("text-danger");

        } else if (statusNo == 1) {
            statusStr = "TESLİM EDİLDİ";
            td.classList.add("text-success");

        } else if (statusNo == 3) {
            statusStr = "STOK YOK";
            td.classList.add("table-warning");

        } else if (statusNo == 0) {
            statusStr = "TESLİM BEKLİYOR";
            td.classList.add("table-success");
        } else {
            statusStr = statusNo;
        }

        td.innerHTML = statusStr;
        tr.appendChild(td);



        if (statusNo == 2) {
            td = document.createElement('td');
            td.classList.add("text-center");
            button = document.createElement('button');
            button.setAttribute("type", "button");
            button.classList.add("btn", "btn-sm", "btn-danger", "kddButtonSize");
            button.innerHTML = "SİL";
            button.setAttribute("data-bs-teslim-id", rvalue["id"]);
            td.appendChild(button);
            tr.appendChild(td);

            button.setAttribute("data-bs-teslim-type", "sil");
            button.addEventListener("click", async (event) => {
                const button = event.target;
                teslimIslemleri(button);
            });


            td = document.createElement('td');
            tr.appendChild(td);

        } else if (statusNo == 1) {
            td = document.createElement('td');
            td.classList.add("text-center");
            button = document.createElement('button');
            button.setAttribute("type", "button");
            button.classList.add("btn", "btn-sm", "btn-info", "kddButtonSize");
            button.innerHTML = "İADE";
            button.setAttribute("data-bs-teslim-id", rvalue["id"]);
            td.appendChild(button);
            tr.appendChild(td);
            button.setAttribute("data-bs-teslim-type", "iade");

            button.addEventListener("click", async (event) => {
                const button = event.target;
                teslimIslemleri(button);
            });


            td = document.createElement('td');
            tr.appendChild(td);

        } else if (statusNo == 3) {
            td = document.createElement('td');
            td.classList.add("text-center");
            button = document.createElement('button');
            button.setAttribute("type", "button");
            button.classList.add("btn", "btn-sm", "btn-warning", "kddButtonSize");
            button.innerHTML = "SİPARİŞ";
            button.setAttribute("data-bs-teslim-id", rvalue["id"]);
            button.setAttribute("data-bs-teslim-type", "siparis");

            button.addEventListener("click", async (event) => {
                const button = event.target;
                teslimIslemleri(button);
            });


            td.appendChild(button);
            tr.appendChild(td);

            td = document.createElement('td');
            td.classList.add("text-center");
            button = document.createElement('button');
            button.setAttribute("type", "button");
            button.classList.add("btn", "btn-sm", "btn-danger", "kddButtonSize");
            button.innerHTML = "İPTAL";
            button.setAttribute("data-bs-teslim-id", rvalue["id"]);
            button.setAttribute("data-bs-teslim-type", "iptal");

            button.addEventListener("click", async (event) => {
                const button = event.target;
                teslimIslemleri(button);
            });

            td.appendChild(button);
            tr.appendChild(td);

        } else if (statusNo == 0) {
            td = document.createElement('td');
            td.classList.add("text-center");
            button = document.createElement('button');
            button.setAttribute("type", "button");
            button.classList.add("btn", "btn-sm", "btn-success", "kddButtonSize");
            button.innerHTML = "TESLİM";
            button.setAttribute("data-bs-teslim-id", rvalue["id"]);
            button.setAttribute("data-bs-teslim-type", "teslim");

            button.addEventListener("click", async (event) => {
                const button = event.target;
                teslimIslemleri(button);
            });

            td.appendChild(button);
            tr.appendChild(td);

            td = document.createElement('td');
            td.classList.add("text-center");
            button = document.createElement('button');
            button.setAttribute("type", "button");
            button.classList.add("btn", "btn-sm", "btn-danger", "kddButtonSize");
            button.innerHTML = "İPTAL";
            button.setAttribute("data-bs-teslim-id", rvalue["id"]);
            button.setAttribute("data-bs-teslim-type", "iptal");

            button.addEventListener("click", async (event) => {
                const button = event.target;
                teslimIslemleri(button);
            });

            td.appendChild(button);
            tr.appendChild(td);
        }

        td = document.createElement('td');
        td.classList.add("text-center");
        td.innerHTML = dateFormatTimeStampWithTime(rvalue["islemDate"]);
        tr.appendChild(td);



        tbody.appendChild(tr);

        i++

    }



    table.appendChild(tbody);
    donanimTeslimTable.appendChild(table);


}

function teslimIslemleri(button) {
    console.log(button);



    try {
        let url = '/kdd/PersonelTeslim/List/';

        let result = await asyncAjax(kolGridSearchData, url, 'POST');

        if (result.status) {

            KddDonanimTalepTable(result, donanimTeslimTable);

        } else {

            donanimTeslimMsg.classList.remove("d-none");
            showAlertMsg({ typeClass: 'alert-warning', msg: '' + result.errorMsg }, ".donanimTeslimMsg");


        }
    } catch (error) {

        donanimTeslimMsg.classList.remove("d-none");
        showAlertMsg({ typeClass: 'alert-danger', msg: '' + error.errorMsg || 'Sistem hatası' }, ".donanimTeslimMsg")
    }




}