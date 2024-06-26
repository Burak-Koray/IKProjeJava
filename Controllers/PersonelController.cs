using Microsoft.AspNetCore.Mvc;
using IKProje.Models;
using System.Linq;

namespace IKProje.Controllers
{
    public class PersonelController : Controller
    {
        private readonly Pro02SbtContext dbContext;

        public PersonelController(Pro02SbtContext dbContext)
        {
            this.dbContext = dbContext;
        }

        public IActionResult List()
        {
            return View();
        }

        [HttpGet]
        public JsonResult GetPersonel()
        {
            var personel = dbContext.Sicils.ToList();
            return Json(personel);
        }

        [HttpPost]
        public JsonResult Add([FromBody] Sicil model)
        {
            if (ModelState.IsValid)
            {
                dbContext.Sicils.Add(model);
                dbContext.SaveChanges();
                return Json("Personel Başarıyla Kaydedildi.");
            }
            return Json("Personel Kaydedilemedi.");
        }

        [HttpGet]
        public JsonResult Edit(int id)
        {
            var personel = dbContext.Sicils.Find(id);
            return Json(personel);

        }
        // Update eylemi
        [HttpPost]
        public JsonResult Update([FromBody] Sicil model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var existingPersonel = dbContext.Sicils.FirstOrDefault(p => p.SId == model.SId);
                    if (existingPersonel != null)
                    {
                        // Güncellenecek alanları model üzerindeki verilere göre ayarla
                        existingPersonel.Sicilno = model.Sicilno;
                        existingPersonel.Adisoyadi = model.Adisoyadi;
                        existingPersonel.Bolumadi = model.Bolumadi;
                        existingPersonel.Ozelkod = model.Ozelkod;
                        existingPersonel.Mesaiadi = model.Mesaiadi;
                        existingPersonel.Giristarihi = model.Giristarihi;
                        existingPersonel.Cikistarihi = model.Cikistarihi;

                        dbContext.SaveChanges();
                        return Json("Personel Başarıyla Güncellendi.");
                    }
                    else
                    {
                        return Json("Güncellenecek personel bulunamadı.");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.Message);
                    return Json("Personel Güncellenirken bir hata oluştu.");
                }
            }
            return Json("Geçersiz veri, personel güncellenemedi.");
        }   

        [HttpDelete]
        public JsonResult Delete(int id)
        {
            var personel = dbContext.Sicils.Find(id);
            if (personel != null)
            {
                dbContext.Sicils.Remove(personel);
                dbContext.SaveChanges();
                return Json("Personel Silindi");
            }
            return Json("Kullanıcı Bulunamadı");
        }

        [HttpGet]
        public JsonResult Search(string adiSoyadi)
        {
            if (!string.IsNullOrEmpty(adiSoyadi))
            {
                var personelList = dbContext.Sicils
                                        .Where(p => p.Adisoyadi.Contains(adiSoyadi))
                                        .ToList();
                return Json(personelList);
            }
            else
            {
                return Json("Arama kriteri belirtilmedi.");
            }
        }

    }
}


    


