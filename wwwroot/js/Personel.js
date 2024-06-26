document.addEventListener("DOMContentLoaded", function () {
    console.log('Belge hazır');

    const rowsPerPage = 10; // Her sayfada gösterilecek maksimum satır sayısı
    let currentPage = 1; // Başlangıçta 1. sayfayı gösterelim
    let personelData = []; // Global değişken olarak personel verisi

    // Sayfa yüklendiğinde personelleri getir
    GetPersonel();

    // Arama inputu için input event'i
    document.getElementById('search').addEventListener('input', function () {
        var searchInput = this.value.trim().toLowerCase();

        if (searchInput === "") {
            currentPage = 1; // Arama kutusu boşaltıldığında sayfayı 1'e sıfırla
            GetPersonel(); // Tüm personelleri getir
            return;
        }

        fetch('/Personel/Search?adiSoyadi=' + searchInput, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sunucu hatası: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                personelData = data; // Arama sonucunu global değişkene atama
                updatePageContent(currentPage, personelData); // Personel listesini güncelle
            })
            .catch(error => {
                console.error('Hata:', error);
                alert('Arama sırasında bir hata oluştu veya sonuç bulunamadı.');
            });
    });

    // Personel Ekle butonu olayı
    document.getElementById('btnadd').addEventListener('click', function () {
        clearModal();
        var modal = new bootstrap.Modal(document.getElementById('PersonelModal'));
        modal.show();
        document.getElementById('exampleModalLabel').textContent = 'Personel Ekle';
        document.getElementById('btnSave').style.display = 'block';
        document.getElementById('btnUpdate').style.display = 'none';
    });

    // Kaydet butonu olayı
    document.getElementById('btnSave').addEventListener('click', function () {
        Add();
    });

    // Güncelle butonu olayı
    document.getElementById('btnUpdate').addEventListener('click', function () {
        Update();
    });

    // Sayfa içeriğini güncelleme fonksiyonu
    function updatePageContent(pageNum, data) {
        const paginatedData = paginateData(pageNum, data, rowsPerPage);
        renderPage(paginatedData);
        updatePaginationControls(data.length);
    }

    // Sayfa içeriğini görselleştirme fonksiyonu
    function renderPage(data) {
        const tableBody = document.getElementById('tblBody');
        tableBody.innerHTML = ''; // Tabloyu temizle

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">Kayıt bulunamadı.</td></tr>';
            return;
        }

        // Veri içinde döngü yaparak her bir satırı oluştur
        data.forEach(item => {
            var row = createTableRow(item);
            tableBody.appendChild(row);
        });
    }

    // Dummy data oluşturma (örnek amaçlı)
    function paginateData(pageNum, data, pageSize) {
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = pageNum * pageSize;
        return data.slice(startIndex, endIndex);
    }

    // Pagination kontrollerini güncelleme
    function updatePaginationControls(totalItems) {
        const paginationList = document.getElementById('paginationList');
        paginationList.innerHTML = ''; // Mevcut pagination düğmelerini temizle

        const totalPages = Math.ceil(totalItems / rowsPerPage);

        const previousPageButton = document.createElement('li');
        previousPageButton.className = 'page-item';
        previousPageButton.id = 'previousPage';
        previousPageButton.innerHTML = '<a class="page-link" href="#" tabindex="-1">Geri</a>';
        previousPageButton.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                updatePageContent(currentPage, personelData);
            }
        });
        paginationList.appendChild(previousPageButton);

        const firstPageButton = document.createElement('li');
        firstPageButton.className = 'page-item';
        firstPageButton.id = 'firstPage';
        firstPageButton.innerHTML = '<a class="page-link" href="#">İlk</a>';
        firstPageButton.addEventListener('click', function () {
            currentPage = 1;
            updatePageContent(currentPage, personelData);
        });
        paginationList.appendChild(firstPageButton);

        // 3'er 3'er artan sayfa numaraları
        const startPage = Math.floor((currentPage - 1) / 3) * 3 + 1;
        const endPage = Math.min(startPage + 2, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item ' + (i === currentPage ? 'active' : '');
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', function () {
                currentPage = i;
                updatePageContent(currentPage, personelData);
            });
            paginationList.appendChild(pageItem);
        }

        const lastPageButton = document.createElement('li');
        lastPageButton.className = 'page-item';
        lastPageButton.id = 'lastPage';
        lastPageButton.innerHTML = '<a class="page-link" href="#">Son</a>';
        lastPageButton.addEventListener('click', function () {
            currentPage = totalPages;
            updatePageContent(currentPage, personelData);
        });
        paginationList.appendChild(lastPageButton);

        const nextPageButton = document.createElement('li');
        nextPageButton.className = 'page-item';
        nextPageButton.id = 'nextPage';
        nextPageButton.innerHTML = '<a class="page-link" href="#">İleri</a>';
        nextPageButton.addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                updatePageContent(currentPage, personelData);
            }
        });
        paginationList.appendChild(nextPageButton);

        previousPageButton.classList.toggle('disabled', currentPage === 1);
        nextPageButton.classList.toggle('disabled', currentPage === totalPages);
    }

    // Sayfa içeriğini yükleme fonksiyonu
    function GetPersonel() {
        fetch('/Personel/GetPersonel', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sunucu hatası: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                personelData = data; // Global değişkene atama
                updatePageContent(currentPage, personelData); // Personel listesini güncelle
            })
            .catch(error => {
                console.error('Hata:', error);
                alert('Sunucu hatası: Veri alınamadı.');
            });
    }

    // Verilen bir personel nesnesine göre tablo satırı oluşturma
    function createTableRow(personel) {
        var row = document.createElement('tr');

        // Sicil No
        var sicilno = document.createElement('td');
        sicilno.textContent = personel.sicilno;
        row.appendChild(sicilno);

        // Adı Soyadı
        var adisoyadi = document.createElement('td');
        adisoyadi.textContent = personel.adisoyadi;
        row.appendChild(adisoyadi);

        // Departman Adı
        var bolumadi = document.createElement('td');
        bolumadi.textContent = personel.bolumadi;
        row.appendChild(bolumadi);

        // Özel Kod
        var ozelkod = document.createElement('td');
        ozelkod.textContent = personel.ozelkod;
        row.appendChild(ozelkod);

        // Mesai Adı
        var mesaiadi = document.createElement('td');
        mesaiadi.textContent = personel.mesaiadi;
        row.appendChild(mesaiadi);

        // Giriş Tarihi
        var giristarihi = document.createElement('td');
        giristarihi.textContent = personel.giristarihi;
        row.appendChild(giristarihi);

        // Çıkış Tarihi
        var cikistarihi = document.createElement('td');
        cikistarihi.textContent = personel.cikistarihi;
        row.appendChild(cikistarihi);

        // İşlem Butonları
        var islemCell = document.createElement('td');

        var duzenleBtn = document.createElement('button');
        duzenleBtn.type = 'button';
        duzenleBtn.className = 'btn btn-primary btn-sm';
        duzenleBtn.textContent = 'Düzenle';
        duzenleBtn.addEventListener('click', function () {
            Edit(personel.sId);
        });
        islemCell.appendChild(duzenleBtn);

        var silBtn = document.createElement('button');
        silBtn.type = 'button';
        silBtn.className = 'btn btn-danger btn-sm ms-1';
        silBtn.textContent = 'Sil';
        silBtn.addEventListener('click', function () {
            Delete(personel.sId);
        });
        islemCell.appendChild(silBtn);

        row.appendChild(islemCell);

        return row;
    }

    // Personel Ekleme fonksiyonu
    function Add() {
        const sicilno = document.getElementById('Sicilno').value.trim();
        const adisoyadi = document.getElementById('Adisoyadi').value.trim();
        const bolumadi = document.getElementById('Bolumadi').value.trim();
        const ozelkod = document.getElementById('Ozelkod').value.trim();
        const mesaiadi = document.getElementById('Mesaiadi').value.trim();
        const giristarihi = document.getElementById('Giristarihi').value.trim();
        const cikistarihi = document.getElementById('Cikistarihi').value.trim();

        const newPersonel = {
            sicilno: sicilno,
            adisoyadi: adisoyadi,
            bolumadi: bolumadi,
            ozelkod: ozelkod,
            mesaiadi: mesaiadi,
            giristarihi: giristarihi,
            cikistarihi: cikistarihi
        };

        fetch('/Personel/Add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newPersonel)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Personel eklenirken hata oluştu: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                alert(data); // Başarı veya hata mesajı
                GetPersonel(); // Yeni personeli listeye ekle
                clearModal(); // Modal içeriğini temizle
            })
            .catch(error => {
                console.error('Hata:', error);
                alert('Personel eklenirken bir hata oluştu.');
            });
    }

    // Düzenleme için modalı doldurma fonksiyonu
    // Düzenleme için modalı doldurma fonksiyonu
    // Düzenleme için modalı doldurma fonksiyonu
    function Edit(personelId) {
        console.log('Düzenle butonuna basıldı:', personelId);

        // İlgili personeli bul
        const personel = personelData.find(p => p.sId === personelId);
        if (!personel) {
            console.error('Personel bulunamadı:', personelId);
            return;
        }

        // Modalı doldur
        var modal = new bootstrap.Modal(document.getElementById('PersonelModal'));
        modal.show();
        document.getElementById('exampleModalLabel').textContent = 'Personel Düzenle';
        document.getElementById('btnSave').style.display = 'none';
        document.getElementById('btnUpdate').style.display = 'block';

        // Verileri modal içine yerleştir
        document.getElementById('Sicilno').value = personel.sicilno;
        document.getElementById('Adisoyadi').value = personel.adisoyadi;
        document.getElementById('Bolumadi').value = personel.bolumadi;
        document.getElementById('Ozelkod').value = personel.ozelkod;
        document.getElementById('Mesaiadi').value = personel.mesaiadi;
        document.getElementById('Giristarihi').value = personel.giristarihi;
        document.getElementById('Cikistarihi').value = personel.cikistarihi;

        // Güncelleme butonuna personel ID'sini ata
        document.getElementById('btnUpdate').setAttribute('data-personel-id', personel.sId);
    }


    
    // Modal içeriğini temizleme fonksiyonu
    function clearModal() {
        document.getElementById('Sicilno').value = '';
        document.getElementById('Adisoyadi').value = '';
        document.getElementById('Bolumadi').value = '';
        document.getElementById('Ozelkod').value = '';
        document.getElementById('Mesaiadi').value = '';
        document.getElementById('Giristarihi').value = '';
        document.getElementById('Cikistarihi').value = '';
    }

    // Modalı verilerle doldurma fonksiyonu
    function populateModal(personel) {
        document.getElementById('Sicilno').value = personel.sicilno;
        document.getElementById('Adisoyadi').value = personel.adisoyadi;
        document.getElementById('Bolumadi').value = personel.bolumadi;
        document.getElementById('Ozelkod').value = personel.ozelkod;
        document.getElementById('Mesaiadi').value = personel.mesaiadi;
        document.getElementById('Giristarihi').value = personel.giristarihi;
        document.getElementById('Cikistarihi').value = personel.cikistarihi;
        document.getElementById('SId').value = personel.sId; // Hidden input for ID
    }

    // Güncelleme fonksiyonu
    function Update() {
        var formdata = {
            SId: document.getElementById("btnUpdate").getAttribute("data-personel-id"), // SId değeri
            sicilno: document.getElementById("Sicilno").value.trim(),
            adisoyadi: document.getElementById("Adisoyadi").value.trim(),
            bolumadi: document.getElementById("Bolumadi").value.trim(),
            ozelkod: document.getElementById("Ozelkod").value.trim(),
            mesaiadi: document.getElementById("Mesaiadi").value.trim(),
            giristarihi: document.getElementById("Giristarihi").value.trim(),
            cikistarihi: document.getElementById("Cikistarihi").value.trim()
        };

        console.log('Form data:', formdata);

        // Örnek olarak Sicilno elementinin varlığını kontrol edelim
        var sicilnoElement = document.getElementById("Sicilno");
        if (sicilnoElement) {
            var sicilnoValue = sicilnoElement.value.trim();
            formdata.sicilno = sicilnoValue;
        } else {
            console.error('Sicilno elementi bulunamadı.');
            return; // Hata durumunu ele alabilirsiniz
        }

        // Diğer elementler için benzer kontroller yapın
        fetch('/Personel/Update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(formdata)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Sunucu hatası: ' + response.statusText);
                }
                else {
                    alert('Güncelleme Başarılı');
                    return response.json();
                }
            })
            .then(data => {
                // İşlem başarılı olduğunda modalı kapat ve personel listesini güncelle
                var modalElement = document.getElementById('PersonelModal');
                var modal = bootstrap.Modal.getInstance(modalElement); // Modalı kapatmak için instance al
                modal.hide(); // Modalı kapat
                GetPersonel();
            })
            .catch(error => {
                console.error('Hata:', error);
                alert('Güncelleme işlemi sırasında bir hata oluştu.');
            });
    }
    // Silme fonksiyonu
    function Delete(id) {
        if (confirm('Bu personeli silmek istediğinizden emin misiniz?')) {
            fetch(`/Personel/Delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Personel silinirken hata oluştu: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data); // Başarı veya hata mesajı
                    GetPersonel(); // Silinmiş personeli listeden kaldır
                })
                .catch(error => {
                    console.error('Hata:', error);
                    alert('Personel silinirken bir hata oluştu.');
                });
        }
    }

   
});

