
// EcomSpace Randevu Sistemi - Egitmen/Admin Ayirimi
// Her mentor icin ayri sifreler
const MENTOR_SIFRELERI = {
  "Muhammet Örteş": "muhammet123",
  "Enes Çiğil": "enes123", 
  "Yunus Yavuz": "yunus123",
  "Filiz Güldoğan": "filiz123"
};

// Admin şifresi
const ADMIN_SIFRE = "admin2024";

const panels = {
  randevuAl: document.getElementById("panelRandevuAl"),
  randevuIptal: document.getElementById("panelRandevuIptal"),
  egitmen: document.getElementById("panelEgitmen"),
  gecmis: document.getElementById("panelGecmis"),
  degerlendirmeler: document.getElementById("panelDegerlendirmeler")
};
const alertDiv = document.getElementById("alert");
const egitmenPanel = document.getElementById("panelEgitmenGiris");
const egitmenTrigger = document.getElementById("egitmenGirisTrigger");
const egitmenOverlay = document.getElementById("egitmenPanelOverlay");
const closeEgitmenBtn = document.getElementById("closeEgitmenPanel");
const btnGecmisEgitmen = document.getElementById("btnGecmis");
const btnGecmiseGeri = document.getElementById("btnGecmiseGeri");
const btnDegerlendirmeler = document.getElementById("btnDegerlendirmeler");
const btnDegerlendirmelereGeri = document.getElementById("btnDegerlendirmelereGeri");

let egitmenGirisYapildi = false;
let adminGirisYapildi = false;
let aktifMentor = null;

// Alert gösterme fonksiyonu
function showAlert(message, type = 'success') {
  alertDiv.textContent = message;
  alertDiv.className = `alert ${type}`;
  alertDiv.classList.remove('hidden');
  setTimeout(() => alertDiv.classList.add('hidden'), 4000);
}

// Panel değiştirme fonksiyonu
function showPanel(panelName) {
  Object.values(panels).forEach(panel => panel.classList.remove('active'));
  if (panels[panelName]) {
    panels[panelName].classList.add('active');
  }
}

// Local Storage yönetimi
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Randevu nedeni değişikliği
document.addEventListener('DOMContentLoaded', function() {
  const randevuNedeniSelect = document.getElementById("randevuNedeni");
  const digerContainer = document.getElementById("digerNedenContainer");
  const digerNeden = document.getElementById("digerNeden");

  if (randevuNedeniSelect) {
    randevuNedeniSelect.addEventListener('change', function() {
      if (this.value === "Diğer") {
        digerContainer.classList.remove("hidden");
        digerNeden.required = true;
      } else {
        digerContainer.classList.add("hidden");
        digerNeden.required = false;
        digerNeden.value = "";
      }
    });
  }

  // Eğitmen giriş modalındaki mentör seçimi
  const loginMentorSelect = document.getElementById("loginMentorSelect");
  const mentorPasswordInfo = document.getElementById("mentorPasswordInfo");
  const mentorInfo = document.getElementById("mentorInfo");
  const adminInfo = document.getElementById("adminInfo");

  if (loginMentorSelect && mentorPasswordInfo) {
    loginMentorSelect.addEventListener('change', function() {
      if (this.value) {
        mentorPasswordInfo.style.display = "block";

        // Admin seçildiyse özel bilgi göster
        if (this.value === "ADMIN") {
          if (mentorInfo) mentorInfo.style.display = "none";
          if (adminInfo) adminInfo.style.display = "block";
        } else {
          if (mentorInfo) mentorInfo.style.display = "block";
          if (adminInfo) adminInfo.style.display = "none";
        }
      } else {
        mentorPasswordInfo.style.display = "none";
        if (mentorInfo) mentorInfo.style.display = "block";
        if (adminInfo) adminInfo.style.display = "none";
      }
    });
  }

  // Tarih seçildikten sonra değiştirmeyi engelle
  const randevuTarih = document.getElementById("randevuTarih");

  if (randevuTarih) {
    randevuTarih.addEventListener('change', function() {
      if (this.value) {
        this.setAttribute('readonly', true);
        this.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
        this.style.borderColor = 'rgba(0, 212, 255, 0.5)';

        // Tarihi sıfırlama butonu ekle
        if (!document.getElementById('resetRandevuTarih')) {
          const resetBtn = document.createElement('button');
          resetBtn.type = 'button';
          resetBtn.id = 'resetRandevuTarih';
          resetBtn.className = 'btn-secondary';
          resetBtn.style.marginTop = '0.5rem';
          resetBtn.innerHTML = '<i class="fas fa-undo"></i> Tarihi Değiştir';
          resetBtn.onclick = () => {
            randevuTarih.removeAttribute('readonly');
            randevuTarih.style.backgroundColor = '';
            randevuTarih.style.borderColor = '';
            randevuTarih.value = '';
            resetBtn.remove();
            loadRandevuSaatleri();
          };
          this.parentNode.appendChild(resetBtn);
        }
      }
    });
  }
});

// Eğitmen giriş modal işlemleri
egitmenTrigger.onclick = () => {
  egitmenPanel.classList.add("active");
  egitmenOverlay.classList.add("active");
};

closeEgitmenBtn.onclick = () => {
  egitmenPanel.classList.remove("active");
  egitmenOverlay.classList.remove("active");
};

egitmenOverlay.onclick = (e) => {
  if (e.target === egitmenOverlay) {
    egitmenPanel.classList.remove("active");
    egitmenOverlay.classList.remove("active");
  }
};

// Eğitmen/Admin giriş kontrolü
document.getElementById("btnEgitmenGiris").onclick = () => {
  const mentor = document.getElementById("loginMentorSelect").value;
  const sifre = document.getElementById("egitmenSifre").value;

  if (!mentor) {
    showAlert("Lütfen giriş türü seçin!", 'error');
    return;
  }

  // Admin girişi kontrolü
  if (mentor === "ADMIN" || sifre === ADMIN_SIFRE) {
    if (sifre !== ADMIN_SIFRE) {
      showAlert("Hatalı admin şifresi!", 'error');
      return;
    }

    adminGirisYapildi = true;
    egitmenGirisYapildi = false;
    aktifMentor = null;
    showPanel('egitmen');
    egitmenPanel.classList.remove("active");
    egitmenOverlay.classList.remove("active");

    // Admin panelini ayarla
    document.getElementById("activeMentorName").textContent = "👑 ADMIN - Tüm Erişim";
    document.getElementById("adminMentorSelect").disabled = false;
    document.getElementById("adminMentorSelect").value = "";

    showAlert("🔥 Admin olarak giriş yapıldı! Tüm sisteme erişiminiz var.");
    loadMusaitSaatler();
    hideSaatEklemeCard();
    updateAdminInterface();
    return;
  }

  // Mentör girişi kontrolü
  const dogruSifre = MENTOR_SIFRELERI[mentor];

  if (!dogruSifre) {
    showAlert("Bu mentör için şifre tanımlanmamış!", 'error');
    return;
  }

  if (sifre === dogruSifre) {
    egitmenGirisYapildi = true;
    adminGirisYapildi = false;
    aktifMentor = mentor;
    showPanel('egitmen');
    egitmenPanel.classList.remove("active");
    egitmenOverlay.classList.remove("active");

    // Eğitmen panelini ayarla
    document.getElementById("activeMentorName").textContent = mentor;
    document.getElementById("adminMentorSelect").value = mentor;
    document.getElementById("adminMentorSelect").disabled = true;

    showAlert(`${mentor} olarak giriş yapıldı!`);
    loadMusaitSaatler();
    showSaatEklemeCard();
    updateEgitmenInterface();
  } else {
    showAlert("Hatalı şifre! Her mentörün kendine özel şifresi vardır.", 'error');
  }

  document.getElementById("egitmenSifre").value = "";
  document.getElementById("loginMentorSelect").value = "";
};

// Admin arayüzü güncellemeleri
function updateAdminInterface() {
  // Admin için özel butonlar ve özellikler ekle
  const adminBadge = document.createElement('div');
  adminBadge.className = 'admin-badge';
  adminBadge.innerHTML = '👑 ADMIN MODU';
  adminBadge.style.cssText = `
    background: linear-gradient(135deg, #ffd700, #ffed4a);
    color: #1a1a1a;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    animation: pulse 2s infinite;
  `;

  const activeMentorInfo = document.querySelector('.active-mentor-info');
  if (activeMentorInfo && !document.querySelector('.admin-badge')) {
    activeMentorInfo.appendChild(adminBadge);
  }

  // Sistem yönetimi bölümünü göster (sadece admin görebilir)
  const sistemYonetimiSection = document.querySelector('.admin-section:last-of-type');
  if (sistemYonetimiSection) {
    const sistemYonetimiBaslik = sistemYonetimiSection.querySelector('h3');
    if (sistemYonetimiBaslik && sistemYonetimiBaslik.textContent.includes('Sistem Yönetimi')) {
      sistemYonetimiSection.style.display = 'block';
    }
  }
}

// Eğitmen arayüzü güncellemeleri
function updateEgitmenInterface() {
  // Admin badge'ini kaldır
  const adminBadge = document.querySelector('.admin-badge');
  if (adminBadge) {
    adminBadge.remove();
  }

  // Sistem yönetimi bölümünü gizle (sadece admin görebilir)
  const sistemYonetimiSection = document.querySelector('.admin-section:last-of-type');
  if (sistemYonetimiSection) {
    const sistemYonetimiBaslik = sistemYonetimiSection.querySelector('h3');
    if (sistemYonetimiBaslik && sistemYonetimiBaslik.textContent.includes('Sistem Yönetimi')) {
      sistemYonetimiSection.style.display = 'none';
    }
  }
}

// Eğitmen çıkış
document.getElementById("btnEgitmenCikis").onclick = () => {
  egitmenGirisYapildi = false;
  adminGirisYapildi = false;
  aktifMentor = null;

  // Arayüzü sıfırla
  document.getElementById("activeMentorName").textContent = "Mentör seçilmedi";
  document.getElementById("adminMentorSelect").value = "";
  document.getElementById("adminMentorSelect").disabled = false;

  // Admin badge'ini kaldır
  const adminBadge = document.querySelector('.admin-badge');
  if (adminBadge) {
    adminBadge.remove();
  }

  hideSaatEklemeCard();
  showPanel('randevuAl');
  showAlert("Çıkış yapıldı.");
};

// Saat ekleme işlemi
document.getElementById("btnSaatEkle").onclick = () => {
  if (!aktifMentor && !adminGirisYapildi) {
    showAlert("Lütfen önce mentör seçin!", 'error');
    return;
  }

  const tarih = document.getElementById("saatTarih").value;
  const saat = document.getElementById("saatSaat").value;
  let mentor = aktifMentor;

  // Admin ise mentör seçimi yapabilir
  if (adminGirisYapildi) {
    mentor = document.getElementById("adminMentorSelect").value;
    if (!mentor) {
      showAlert("Admin olarak mentör seçmelisiniz!", 'error');
      return;
    }
  }

  if (!tarih || !saat) {
    showAlert("Lütfen tarih ve saat seçin!", 'error');
    return;
  }

  const musaitSaatler = loadData('musaitSaatler');
  const yeniSaat = {
    id: Date.now(),
    tarih: tarih,
    saat: saat,
    mentor: mentor,
    rezerve: false,
    ekleyenMentor: aktifMentor || 'Admin' // Kimin eklediğini kaydet
  };

  // Aynı mentör, tarih ve saatte başka randevu var mı kontrol et
  const mevcutSaat = musaitSaatler.find(s => 
    s.tarih === tarih && 
    s.saat === saat && 
    s.mentor === mentor
  );

  if (mevcutSaat) {
    showAlert("Bu tarih ve saatte zaten bir slot mevcut!", 'error');
    return;
  }

  musaitSaatler.push(yeniSaat);
  saveData('musaitSaatler', musaitSaatler);
  loadMusaitSaatler();
  loadRandevuSaatleri();
  showAlert(`${mentor} için saat başarıyla eklendi!`);

  // Sadece saat alanını sıfırla, tarihi sabit tut
  document.getElementById("saatSaat").value = "";
};

// Müsait saatleri yükleme - Rol bazlı filtreleme
function loadMusaitSaatler() {
  const musaitSaatler = loadData('musaitSaatler');
  let filtrelenmisler = musaitSaatler;

  // Eğitmen ise sadece kendi eklediği saatleri göster
  if (egitmenGirisYapildi && !adminGirisYapildi) {
    filtrelenmisler = musaitSaatler.filter(s => 
      s.mentor === aktifMentor || s.ekleyenMentor === aktifMentor
    );
  }
  // Admin ise mentör seçimine göre filtrele
  else if (adminGirisYapildi) {
    const secilenMentor = document.getElementById("adminMentorSelect").value;
    if (secilenMentor) {
      filtrelenmisler = musaitSaatler.filter(s => s.mentor === secilenMentor);
    }
  }

  displayFilteredSaatler(filtrelenmisler);
  updateDashboardStats();
}

// Saat silme - Yetki kontrolü
function saatSil(saatId) {
  const musaitSaatler = loadData('musaitSaatler');
  const silinecekSaat = musaitSaatler.find(s => s.id === saatId);

  if (!silinecekSaat) {
    showAlert("Saat bulunamadı!", 'error');
    return;
  }

  // Yetki kontrolü - Eğitmen sadece kendi eklediği saatleri silebilir
  if (egitmenGirisYapildi && !adminGirisYapildi) {
    if (silinecekSaat.ekleyenMentor !== aktifMentor && silinecekSaat.mentor !== aktifMentor) {
      showAlert("Bu saati silme yetkiniz yok!", 'error');
      return;
    }
  }

  const yeniMusaitSaatler = musaitSaatler.filter(s => s.id !== saatId);
  saveData('musaitSaatler', yeniMusaitSaatler);
  loadMusaitSaatler();
  loadRandevuSaatleri();
  showAlert("Saat silindi.");
}

// Randevu formu için saatleri yükleme
function loadRandevuSaatleri() {
  const musaitSaatler = loadData('musaitSaatler');
  const saatSelect = document.getElementById("randevuSaat");
  const secilenTarih = document.getElementById("randevuTarih").value;
  const secilenMentor = document.getElementById("randevuMentor").value;

  saatSelect.innerHTML = '<option value="">Saat Seçin</option>';

  if (secilenTarih && secilenMentor) {
    const gunlukSaatler = musaitSaatler.filter(s => 
      s.tarih === secilenTarih && 
      s.mentor === secilenMentor && 
      !s.rezerve
    );

    gunlukSaatler.forEach(saatObj => {
      const option = document.createElement("option");
      option.value = saatObj.id;
      option.textContent = saatObj.saat;
      saatSelect.appendChild(option);
    });

    if (gunlukSaatler.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Bu mentör için müsait saat yok";
      option.disabled = true;
      saatSelect.appendChild(option);
    }
  }
}

// Tarih ve mentör değiştiğinde saatleri güncelle
document.getElementById("randevuTarih").onchange = loadRandevuSaatleri;
document.getElementById("randevuMentor").onchange = loadRandevuSaatleri;

// Randevu alma
document.getElementById("randevuForm").onsubmit = (e) => {
  e.preventDefault();

  const ad = document.getElementById("randevuAd").value;
  const soyad = document.getElementById("randevuSoyad").value;
  const mentor = document.getElementById("randevuMentor").value;
  const telefon = document.getElementById("randevuTelefon").value;
  const tarih = document.getElementById("randevuTarih").value;
  const saatId = document.getElementById("randevuSaat").value;
  const randevuNedeni = document.getElementById("randevuNedeni").value;
  const digerNeden = document.getElementById("digerNeden").value;

  if (!ad || !soyad || !mentor || !telefon || !tarih || !saatId || !randevuNedeni) {
    showAlert("Lütfen tüm zorunlu alanları doldurun!", 'error');
    return;
  }

  if (randevuNedeni === "Diğer" && !digerNeden) {
    showAlert("Lütfen randevu nedeninizi açıklayın!", 'error');
    return;
  }

  // Seçilen saati rezerve yap
  let musaitSaatler = loadData('musaitSaatler');
  const secilenSaat = musaitSaatler.find(s => s.id == saatId);
  if (secilenSaat) {
    secilenSaat.rezerve = true;
    saveData('musaitSaatler', musaitSaatler);
  }

  // Randevuyu kaydet
  const randevular = loadData('randevular');
  const yeniRandevu = {
    id: Date.now(),
    ad, soyad, mentor, telefon, tarih,
    saat: secilenSaat.saat,
    randevuNedeni: randevuNedeni === "Diğer" ? digerNeden : randevuNedeni,
    olusturmaTarihi: new Date().toLocaleString('tr-TR'),
    mentorYorumu: "", // Eğitmen yorumu için alan
    yorumTarihi: null
  };

  randevular.push(yeniRandevu);
  saveData('randevular', randevular);

  showAlert("Randevunuz başarıyla alındı!");
  document.getElementById("randevuForm").reset();
  document.getElementById("digerNedenContainer").classList.add("hidden");

  // Tarih reset butonunu kaldır
  const resetBtn = document.getElementById('resetRandevuTarih');
  if (resetBtn) resetBtn.remove();

  // Tarih readonly'sini kaldır
  const randevuTarihInput = document.getElementById("randevuTarih");
  randevuTarihInput.removeAttribute('readonly');
  randevuTarihInput.style.backgroundColor = '';
  randevuTarihInput.style.borderColor = '';

  loadRandevuSaatleri();
  if (egitmenGirisYapildi || adminGirisYapildi) loadMusaitSaatler();
};

// Geçmiş randevular - Rol bazlı filtreleme
btnGecmisEgitmen.onclick = () => {
  showPanel('gecmis');
  loadGecmisRandevular();
};

btnGecmiseGeri.onclick = () => {
  showPanel('egitmen');
};

// Değerlendirmeler paneli
btnDegerlendirmeler.onclick = () => {
  showPanel('degerlendirmeler');
  loadDegerlendirmeler();
};

btnDegerlendirmelereGeri.onclick = () => {
  showPanel('egitmen');
};

// Geçmiş randevuları yükleme - Rol bazlı filtreleme ve yorum özelliği
function loadGecmisRandevular() {
  const randevular = loadData('randevular');
  let filtrelenmisler = randevular;

  // Eğitmen ise sadece kendi randevularını göster
  if (egitmenGirisYapildi && !adminGirisYapildi) {
    filtrelenmisler = randevular.filter(r => r.mentor === aktifMentor);
  }

  const gecmisListesi = document.getElementById("gecmisRandevuListesi");
  gecmisListesi.innerHTML = "";

  if (filtrelenmisler.length === 0) {
    gecmisListesi.innerHTML = '<p>Henüz randevu bulunmuyor.</p>';
    return;
  }

  filtrelenmisler.reverse().forEach(randevu => {
    const randevuDiv = document.createElement("div");
    randevuDiv.className = "randevu-item";

    // Yorum bölümü
    const yorumBolumu = `
      <div class="yorum-bolumu" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
        <h5 style="color: #00d4ff; margin-bottom: 0.5rem;"><i class="fas fa-comment"></i> Mentör Yorumu:</h5>
        ${randevu.mentorYorumu ? 
          `<div class="mevcut-yorum" style="background: rgba(0,212,255,0.1); padding: 0.8rem; border-radius: 8px; margin-bottom: 0.5rem;">
            <p style="margin: 0; font-style: italic;">"${randevu.mentorYorumu}"</p>
            <small style="color: rgba(255,255,255,0.6);">Yorum Tarihi: ${randevu.yorumTarihi}</small>
          </div>` : 
          '<p style="color: rgba(255,255,255,0.5); margin: 0;">Henüz yorum yapılmamış.</p>'
        }
        ${(egitmenGirisYapildi && randevu.mentor === aktifMentor) || adminGirisYapildi ? 
          `<div class="yorum-ekleme" style="margin-top: 0.8rem;">
            <textarea id="yorum_${randevu.id}" placeholder="Randevu için yorumunuzu yazın..." 
              style="width: 100%; min-height: 60px; margin-bottom: 0.5rem; resize: vertical;">${randevu.mentorYorumu || ''}</textarea>
            <button class="btn-primary" onclick="yorumKaydet(${randevu.id})" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
              <i class="fas fa-save"></i> ${randevu.mentorYorumu ? 'Yorumu Güncelle' : 'Yorum Ekle'}
            </button>
          </div>` : ''
        }
      </div>
    `;

    randevuDiv.innerHTML = `
      <h4>${randevu.ad} ${randevu.soyad}</h4>
      <p><strong>Mentör:</strong> ${randevu.mentor}</p>
      <p><strong>Tarih:</strong> ${randevu.tarih} - ${randevu.saat}</p>
      <p><strong>Telefon:</strong> ${randevu.telefon}</p>
      <p><strong>Randevu Nedeni:</strong> ${randevu.randevuNedeni}</p>
      <p><strong>Randevu Alındığı Tarih:</strong> ${randevu.olusturmaTarihi}</p>
      ${yorumBolumu}
    `;
    gecmisListesi.appendChild(randevuDiv);
  });
}

// Yorum kaydetme fonksiyonu
function yorumKaydet(randevuId) {
  const yorumTextarea = document.getElementById(`yorum_${randevuId}`);
  const yorum = yorumTextarea.value.trim();

  if (!yorum) {
    showAlert("Lütfen bir yorum yazın!", 'error');
    return;
  }

  let randevular = loadData('randevular');
  const randevu = randevular.find(r => r.id === randevuId);

  if (!randevu) {
    showAlert("Randevu bulunamadı!", 'error');
    return;
  }

  // Yetki kontrolü
  if (egitmenGirisYapildi && !adminGirisYapildi && randevu.mentor !== aktifMentor) {
    showAlert("Bu randevuya yorum yapma yetkiniz yok!", 'error');
    return;
  }

  randevu.mentorYorumu = yorum;
  randevu.yorumTarihi = new Date().toLocaleString('tr-TR');

  saveData('randevular', randevular);
  showAlert("Yorum başarıyla kaydedildi!");
  loadGecmisRandevular(); // Listeyi yenile
}

// Tüm randevuları Excel'e aktarma - Yorumlarla birlikte
document.getElementById("btnExcel").onclick = () => {
  const randevular = loadData('randevular');

  if (randevular.length === 0) {
    showAlert("Aktarılacak randevu bulunmuyor!", 'error');
    return;
  }

  // Excel için veriyi düzenle
  const excelData = randevular.map(randevu => ({
    'Ad': randevu.ad,
    'Soyad': randevu.soyad,
    'Mentör': randevu.mentor,
    'Telefon': randevu.telefon,
    'Tarih': randevu.tarih,
    'Saat': randevu.saat,
    'Randevu_Nedeni': randevu.randevuNedeni,
    'Oluşturma_Tarihi': randevu.olusturmaTarihi,
    'Mentör_Yorumu': randevu.mentorYorumu || 'Yorum yok',
    'Yorum_Tarihi': randevu.yorumTarihi || 'Yorum yok'
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tüm Randevular");
  XLSX.writeFile(wb, `tum_randevular_${new Date().toISOString().split('T')[0]}.xlsx`);
  showAlert("Tüm randevular Excel dosyası indirildi!");
};

// Seçili mentör Excel'e aktarma
document.getElementById("btnMentorExcel").onclick = () => {
  const secilenMentor = document.getElementById("mentorExcelSelect").value;

  if (!secilenMentor) {
    showAlert("Lütfen bir mentör seçin!", 'error');
    return;
  }

  const randevular = loadData('randevular');
  const mentorRandevulari = randevular.filter(r => r.mentor === secilenMentor);

  if (mentorRandevulari.length === 0) {
    showAlert("Bu mentör için randevu bulunmuyor!", 'error');
    return;
  }

  // Excel için veriyi düzenle
  const excelData = mentorRandevulari.map(randevu => ({
    'Ad': randevu.ad,
    'Soyad': randevu.soyad,
    'Telefon': randevu.telefon,
    'Tarih': randevu.tarih,
    'Saat': randevu.saat,
    'Randevu_Nedeni': randevu.randevuNedeni,
    'Oluşturma_Tarihi': randevu.olusturmaTarihi,
    'Mentör_Yorumu': randevu.mentorYorumu || 'Yorum yok',
    'Yorum_Tarihi': randevu.yorumTarihi || 'Yorum yok'
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, secilenMentor);
  XLSX.writeFile(wb, `${secilenMentor.replace(' ', '_')}_randevular_${new Date().toISOString().split('T')[0]}.xlsx`);
  showAlert(`${secilenMentor} için Excel dosyası indirildi!`);
};

// Değerlendirmeleri Excel'e aktarma
document.getElementById("btnDegerlendirmeExcel").onclick = () => {
  const feedbacks = loadData('feedbacks');

  if (feedbacks.length === 0) {
    showAlert("Aktarılacak değerlendirme bulunmuyor!", 'error');
    return;
  }

  // Excel için veriyi düzenle
  const excelData = feedbacks.map(feedback => ({
    'Puan': feedback.rating,
    'Yorum': feedback.comment || 'Yorum yok',
    'Tarih': feedback.date,
    'Yıldız_Gösterimi': '⭐'.repeat(feedback.rating)
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Değerlendirmeler");
  XLSX.writeFile(wb, `degerlendirmeler_${new Date().toISOString().split('T')[0]}.xlsx`);
  showAlert("Değerlendirmeler Excel dosyası indirildi!");
};

// Değerlendirmeleri yükleme fonksiyonu
function loadDegerlendirmeler() {
  const feedbacks = loadData('feedbacks');
  const degerlendirmeListesi = document.getElementById("degerlendirmeListesi");
  const toplamDegerlendirme = document.getElementById("toplamDegerlendirme");
  const ortalamaPuan = document.getElementById("ortalamaPuan");
  const besYildizOrani = document.getElementById("besYildizOrani");

  // Özet istatistikleri hesapla
  const toplam = feedbacks.length;
  const ortalama = toplam > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / toplam).toFixed(1) : 0;
  const besYildiz = feedbacks.filter(f => f.rating === 5).length;
  const besYildizYuzde = toplam > 0 ? Math.round((besYildiz / toplam) * 100) : 0;

  toplamDegerlendirme.textContent = toplam;
  ortalamaPuan.textContent = ortalama;
  besYildizOrani.textContent = `${besYildizYuzde}%`;

  // Değerlendirme listesini temizle
  degerlendirmeListesi.innerHTML = "";

  if (feedbacks.length === 0) {
    degerlendirmeListesi.innerHTML = '<p>Henüz değerlendirme bulunmuyor.</p>';
    return;
  }

  // Değerlendirmeleri tarihe göre sırala (en yeni önce)
  feedbacks.sort((a, b) => b.timestamp - a.timestamp).forEach(feedback => {
    const degerlendirmeDiv = document.createElement("div");
    degerlendirmeDiv.className = "degerlendirme-item";
    
    const yildizlar = '⭐'.repeat(feedback.rating);
    const yorum = feedback.comment ? feedback.comment : 'Yorum yazılmamış';
    const yorumClass = feedback.comment ? '' : 'bos';

    degerlendirmeDiv.innerHTML = `
      <div class="degerlendirme-header">
        <div class="degerlendirme-yildizlar">${yildizlar} (${feedback.rating}/5)</div>
        <div class="degerlendirme-tarih">${feedback.date}</div>
      </div>
      <div class="degerlendirme-yorum ${yorumClass}">
        <i class="fas fa-quote-left"></i> ${yorum}
      </div>
    `;
    degerlendirmeListesi.appendChild(degerlendirmeDiv);
  });
}

// Geçmiş randevuları temizleme - Sadece Admin kontrolü
document.getElementById("btnGecmisTemizle").onclick = () => {
  if (!adminGirisYapildi || egitmenGirisYapildi) {
    showAlert("Bu işlem sadece admin tarafından yapılabilir!", 'error');
    return;
  }

  if (confirm("Tüm geçmiş randevuları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!")) {
    localStorage.removeItem('randevular');

    // Müsait saatleri de serbest bırak
    let musaitSaatler = loadData('musaitSaatler');
    musaitSaatler.forEach(saat => {
      if (!saat.mentor) {
        saat.mentor = 'Belirtilmemiş';
      }
      saat.rezerve = false;
    });
    saveData('musaitSaatler', musaitSaatler);

    loadMusaitSaatler();
    showAlert("Tüm geçmiş randevular temizlendi!");
  }
};

// Değerlendirmeleri temizleme - Sadece Admin kontrolü
document.getElementById("btnDegerlendirmeTemizle").onclick = () => {
  if (!adminGirisYapildi || egitmenGirisYapildi) {
    showAlert("Bu işlem sadece admin tarafından yapılabilir!", 'error');
    return;
  }

  if (confirm("Tüm değerlendirmeleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!")) {
    localStorage.removeItem('feedbacks');
    showAlert("Tüm değerlendirmeler temizlendi!");

    if (panels.degerlendirmeler && panels.degerlendirmeler.classList.contains('active')) {
      loadDegerlendirmeler();
    }
  }
};

// Ana sekmeler
document.getElementById("tabRandevu").onclick = () => {
  showPanel('randevuAl');
  updateActiveTab('tabRandevu');
};

document.getElementById("tabIptal").onclick = () => {
  showPanel('randevuIptal');
  updateActiveTab('tabIptal');
};

function updateActiveTab(activeTabId) {
  document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
  document.getElementById(activeTabId).classList.add('active');
}

// Dashboard istatistiklerini güncelle
function updateDashboardStats() {
  const randevular = loadData('randevular');
  const feedbacks = loadData('feedbacks');

  let filtrelenmisler = randevular;

  // Eğitmen ise sadece kendi randevularını say
  if (egitmenGirisYapildi && !adminGirisYapildi) {
    filtrelenmisler = randevular.filter(r => r.mentor === aktifMentor);
  }

  // Toplam randevu sayısı
  document.getElementById('toplamRandevuSayisi').textContent = filtrelenmisler.length;

  // Ortalama puan
  const ortalama = feedbacks.length > 0 ? 
    (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;
  document.getElementById('dashboardOrtalamaPuan').textContent = ortalama;
}

// Saat filtreleme
function filterSaatler() {
  const filter = document.getElementById('saatFiltre').value;
  const musaitSaatler = loadData('musaitSaatler');

  let filtrelenmisler = musaitSaatler;

  // Rol bazlı filtreleme
  if (egitmenGirisYapildi && !adminGirisYapildi) {
    filtrelenmisler = musaitSaatler.filter(s => 
      s.mentor === aktifMentor || s.ekleyenMentor === aktifMentor
    );
  } else if (adminGirisYapildi) {
    const secilenMentor = document.getElementById("adminMentorSelect").value;
    if (secilenMentor) {
      filtrelenmisler = musaitSaatler.filter(s => s.mentor === secilenMentor);
    }
  }

  // Durum filtresini uygula
  switch(filter) {
    case 'available':
      filtrelenmisler = filtrelenmisler.filter(s => !s.rezerve);
      break;
    case 'booked':
      filtrelenmisler = filtrelenmisler.filter(s => s.rezerve);
      break;
  }

  displayFilteredSaatler(filtrelenmisler);
}

function displayFilteredSaatler(saatler) {
  const saatListesi = document.getElementById("saatListesi");
  saatListesi.innerHTML = "";

  if (saatler.length === 0) {
    saatListesi.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); padding: 2rem;">Filtreye uygun saat bulunamadı.</p>';
    return;
  }

  // Saatleri tarihe göre sırala
  saatler.sort((a, b) => {
    const dateA = new Date(a.tarih + ' ' + a.saat);
    const dateB = new Date(b.tarih + ' ' + b.saat);
    return dateA - dateB;
  });

  saatler.forEach(saatObj => {
    const saatDiv = document.createElement("div");
    saatDiv.className = `saat-item ${saatObj.rezerve ? 'rezerve' : ''}`;

    // Tarihi güzel formatta göster
    const tarihObj = new Date(saatObj.tarih);
    const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    const gunAdi = gunler[tarihObj.getDay()];
    const gun = tarihObj.getDate();
    const ay = aylar[tarihObj.getMonth()];
    const yil = tarihObj.getFullYear();

    const formatliTarih = `${gunAdi}, ${gun} ${ay} ${yil}`;
    const durum = saatObj.rezerve ? 'Rezerve Edildi' : 'Müsait';

    // Silme yetki kontrolü
    const silebilir = adminGirisYapildi || 
      (egitmenGirisYapildi && (saatObj.ekleyenMentor === aktifMentor || saatObj.mentor === aktifMentor));

    saatDiv.innerHTML = `
      <div class="saat-info">
        <div class="saat-tarih">${formatliTarih}</div>
        <div class="saat-zaman">${saatObj.saat}</div>
        <div class="saat-durum">${durum}</div>
        ${saatObj.ekleyenMentor ? `<div style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 0.5rem;">Ekleyen: ${saatObj.ekleyenMentor}</div>` : ''}
      </div>
      <div class="saat-actions">
        ${silebilir ? 
          `<button class="saat-sil" onclick="saatSil(${saatObj.id})">
            <i class="fas fa-trash-alt"></i>
            Sil
          </button>` : 
          `<div style="color: rgba(255,255,255,0.4); font-size: 0.8rem; padding: 0.5rem;">Silme yetkiniz yok</div>`
        }
      </div>
    `;
    saatListesi.appendChild(saatDiv);
  });
}

// Event listener ekle
document.addEventListener('DOMContentLoaded', function() {
  const saatFiltre = document.getElementById('saatFiltre');
  if (saatFiltre) {
    saatFiltre.addEventListener('change', filterSaatler);
  }

  const adminMentorSelect = document.getElementById('adminMentorSelect');
  if (adminMentorSelect) {
    adminMentorSelect.addEventListener('change', function() {
      const secilenMentor = this.value;
      if (secilenMentor && adminGirisYapildi) {
        aktifMentor = secilenMentor; // Admin için aktif mentörü güncelle
        document.getElementById("activeMentorName").textContent = `👑 ADMIN - ${secilenMentor}`;
        showSaatEklemeCard();
        loadMusaitSaatler();
        showAlert(`Admin olarak ${secilenMentor} için saat yönetimi aktif!`);
      } else if (secilenMentor && egitmenGirisYapildi) {
        // Eğitmen kendi mentörlüğünü değiştiremez
        this.value = aktifMentor;
        showAlert("Eğitmen olarak sadece kendi mentörlüğünüzü yönetebilirsiniz!", 'error');
      } else {
        hideSaatEklemeCard();
      }
    });
  }
});

// Sayfa yüklendiğinde
window.onload = () => {
  loadRandevuSaatleri();
  updateDashboardStats();
  // Bugünün tarihini minimum olarak ayarla
  const bugun = new Date().toISOString().split('T')[0];
  document.getElementById("randevuTarih").setAttribute('min', bugun);
  document.getElementById("saatTarih").setAttribute('min', bugun);
};

// Randevu iptal işlemleri
document.getElementById("iptalForm").onsubmit = (e) => {
  e.preventDefault();

  const telefon = document.getElementById("iptalTelefon").value.trim();
  if (!telefon) {
    showAlert("Lütfen telefon numaranızı girin!", 'error');
    return;
  }

  const randevular = loadData('randevular');
  const kullaniciRandevulari = randevular.filter(r => r.telefon === telefon);

  if (kullaniciRandevulari.length === 0) {
    showAlert("Bu telefon numarasına kayıtlı randevu bulunamadı!", 'error');
    document.getElementById("bulunanRandevular").innerHTML = "";
    return;
  }

  showBulunanRandevular(kullaniciRandevulari);
};

function showBulunanRandevular(randevular) {
  const container = document.getElementById("bulunanRandevular");
  container.innerHTML = "";

  randevular.forEach(randevu => {
    const randevuDiv = document.createElement("div");
    randevuDiv.className = "randevu-item iptal-item";
    randevuDiv.innerHTML = `
      <h4>${randevu.ad} ${randevu.soyad}</h4>
      <p><strong>Mentör:</strong> ${randevu.mentor}</p>
      <p><strong>Tarih:</strong> ${randevu.tarih} - ${randevu.saat}</p>
      <p><strong>Randevu Nedeni:</strong> ${randevu.randevuNedeni}</p>
      <p><strong>Randevu Alındığı Tarih:</strong> ${randevu.olusturmaTarihi}</p>
      ${randevu.mentorYorumu ? 
        `<div style="background: rgba(0,212,255,0.1); padding: 0.8rem; border-radius: 8px; margin: 0.5rem 0;">
          <strong style="color: #00d4ff;">Mentör Yorumu:</strong>
          <p style="margin: 0.3rem 0 0 0; font-style: italic;">"${randevu.mentorYorumu}"</p>
        </div>` : ''
      }
      <button class="btn-danger iptal-btn" onclick="randevuIptalEt(${randevu.id})">
        <i class="fas fa-times-circle"></i>
        Randevuyu İptal Et
      </button>
    `;
    container.appendChild(randevuDiv);
  });
}

function randevuIptalEt(randevuId) {
  if (!confirm("Bu randevuyu iptal etmek istediğinizden emin misiniz?")) {
    return;
  }

  // Randevuyu sil
  let randevular = loadData('randevular');
  const iptalEdilecekRandevu = randevular.find(r => r.id === randevuId);
  randevular = randevular.filter(r => r.id !== randevuId);
  saveData('randevular', randevular);

  // İlgili saati tekrar müsait yap
  if (iptalEdilecekRandevu) {
    let musaitSaatler = loadData('musaitSaatler');
    const ilgiliSaat = musaitSaatler.find(s => 
      s.tarih === iptalEdilecekRandevu.tarih && 
      s.saat === iptalEdilecekRandevu.saat
    );

    if (ilgiliSaat) {
      ilgiliSaat.rezerve = false;
      saveData('musaitSaatler', musaitSaatler);
    }
  }

  showAlert("Randevunuz başarıyla iptal edildi!");

  // Listeyi güncelle
  const telefon = document.getElementById("iptalTelefon").value.trim();
  const guncelRandevular = loadData('randevular');
  const kullaniciRandevulari = guncelRandevular.filter(r => r.telefon === telefon);

  if (kullaniciRandevulari.length > 0) {
    showBulunanRandevular(kullaniciRandevulari);
  } else {
    document.getElementById("bulunanRandevular").innerHTML = "<p>Artık aktif randevunuz bulunmuyor.</p>";
  }

  // Eğer eğitmen/admin paneli açıksa saatleri güncelle
  if (egitmenGirisYapildi || adminGirisYapildi) {
    loadMusaitSaatler();
  }
  loadRandevuSaatleri();
}

// KVKK Modal işlemleri
function showKVKKModal() {
  document.getElementById('kvkkModalOverlay').classList.add('active');
}

function showContactModal() {
  document.getElementById('contactModalOverlay').classList.add('active');
}

document.getElementById('closeKVKKModal').onclick = () => {
  document.getElementById('kvkkModalOverlay').classList.remove('active');
};

document.getElementById('closeContactModal').onclick = () => {
  document.getElementById('contactModalOverlay').classList.remove('active');
};

// Modal overlay click to close
document.getElementById('kvkkModalOverlay').onclick = (e) => {
  if (e.target.id === 'kvkkModalOverlay') {
    document.getElementById('kvkkModalOverlay').classList.remove('active');
  }
};

document.getElementById('contactModalOverlay').onclick = (e) => {
  if (e.target.id === 'contactModalOverlay') {
    document.getElementById('contactModalOverlay').classList.remove('active');
  }
};

// Değerlendirme sistemi
let currentRating = 0;
const stars = document.querySelectorAll('.star');
const ratingFeedback = document.getElementById('ratingFeedback');

const ratingMessages = {
  1: "😞 Hizmetimizi nasıl geliştirebiliriz?",
  2: "😐 Memnuniyetsizliğinizin nedenini öğrenebilir miyiz?",
  3: "🙂 Ortalama bir deneyim. Nasıl daha iyi olabiliriz?",
  4: "😊 Güzel! Eksik gördüğünüz noktalar var mı?",
  5: "🎉 Harika! Teşekkürler! Deneyiminizi paylaşın."
};

stars.forEach(star => {
  star.addEventListener('click', function() {
    currentRating = parseInt(this.dataset.rating);
    updateStars();
    ratingFeedback.textContent = ratingMessages[currentRating];
  });

  star.addEventListener('mouseenter', function() {
    const hoverRating = parseInt(this.dataset.rating);
    highlightStars(hoverRating);
  });
});

document.querySelector('.stars').addEventListener('mouseleave', function() {
  updateStars();
});

function updateStars() {
  stars.forEach((star, index) => {
    if (index < currentRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

function highlightStars(rating) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
}

// Değerlendirme gönderme
document.getElementById('submitFeedback').onclick = () => {
  const feedbackText = document.getElementById('feedbackText').value.trim();

  if (currentRating === 0) {
    showAlert("Lütfen önce bir puan verin!", 'error');
    return;
  }

  const feedback = {
    rating: currentRating,
    comment: feedbackText,
    date: new Date().toLocaleString('tr-TR'),
    timestamp: Date.now()
  };

  // Geri bildirimleri localStorage'a kaydet
  const feedbacks = loadData('feedbacks');
  feedbacks.push(feedback);
  saveData('feedbacks', feedbacks);

  showAlert(`${currentRating} yıldızlı değerlendirmeniz için teşekkürler! 🙏`);

  // Formu sıfırla
  currentRating = 0;
  updateStars();
  ratingFeedback.textContent = "";
  document.getElementById('feedbackText').value = "";
};

// Saat ekleme kartını göster/gizle
function showSaatEklemeCard() {
  document.getElementById("saatEklemeCard").style.display = "block";
}

function hideSaatEklemeCard() {
  document.getElementById("saatEklemeCard").style.display = "none";
}

// Global fonksiyonlar
window.saatSil = saatSil;
window.randevuIptalEt = randevuIptalEt;
window.showKVKKModal = showKVKKModal;
window.showContactModal = showContactModal;
window.yorumKaydet = yorumKaydet;
