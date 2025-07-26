# Renkli Tetris Oyunu

Bu proje, 7 yasindaki cocuklar icin ozel olarak tasarlanmis renkli ve eglenceli bir **Tetris** oyunudur. Oyun HTML, CSS ve JavaScript kullanilarak olusturulmustur ve asagidaki ozellikleri barindirir:

## Ozellikler

* **Renkli bloklar ve pastel tonlarda arka plan**: Her tetromino parlak bir renge sahiptir ve sayfanin arka planinda pastel tonlardan olusan yumusak bir degrade vardir (ek bir resim dosyasina gerek yoktur).
* **Seviye atladikca konfeti yagmuru**: Her 10 satir temizlendiginde seviye artar, arka planda renkli konfeti animasyonu gorunur ve oyuncuya "Harika! Tebrik ederim, basardin!" seklinde bir sesli mesaj verilir (tarayicinin `speechSynthesis` API’si kullanilarak).
* **Ayarlanabilir hiz ve zorluk**: Yan panelde bulunan hiz kaydiricisi veya zorluk secicisi ile bloklarin dusme hizini degistirebilirsiniz. Kolay, Normal ve Zor secenekleri mevcuttur.
* **Arka plan muzigi ve ozellestirilebilir calama listesi**: Varsayilan bir muzik dosyasi bulunmaz. Muzik panelindeki `Muzik Yukle` dugmesine tiklayarak bilgisayarinizdan MP3/WAV dosyalari secip kendi calama listenizi olusturabilirsiniz. Secilen dosyalar listeye eklenir ve oynatilabilir.
* **Klavye ve ekran kontrolleri**: Ok tuslari ile veya ekrandaki buyuk butonlarla tetrominolari sola/saga hareket ettirebilir, dondurebilir ya da asagiya birakabilirsiniz. Bu sayede dokunmatik ekranlarda veya kucuk cocuklarin kullanimi icin uygundur.
* **Ayrintili yorumlar**: Tum kod dosyalari Turkce aciklamalar icerir, boylece oyunun nasil calistigini kolayca anlayabilirsiniz.

## Kurulum ve Calistirma

Proje tamamen tarayici uzerinde calisir ve ek bir paket gerektirmez. Kurulum icin su adimlari izleyin:

1. **Dosyalari kopyalayin**: `tetris_game` klasorunu bilgisayarinizda istediginiz yere kopyalayin.
2. **HTML dosyasini acin**: `tetris_game/index.html` dosyasini herhangi bir modern web tarayicisinda acin (Google Chrome, Firefox, Edge vb.). Oyun otomatik olarak baslayacaktir.
3. **Muzik yukleyin (istege bagli)**: Muzik panelindeki `Muzik Yukle` dugmesine tiklayip bilgisayarinizdan bir veya birden fazla ses dosyasi secerek calama listenize yeni sarkilar ekleyebilirsiniz.

## Nasil Oynanir?

1. **Baslat**: Sayfa yuklendigi zaman bir tetromino yukaridan dusmeye baslar.
2. **Tasi/Don**: Sol ve sag ok tuslarini (veya ekrandaki ok butonlarini) kullanarak tetrominoyu hareket ettirin. Yukari ok veya bosluk tusu dondurur. Asagi ok tusu parcayi hizla dusurur.
3. **Satirlari temizle**: Satirlari eksiksiz doldurarak temizleyin. Her 10 satirda bir seviye atlanir ve oyun hizi artar. Ayni zamanda konfeti animasyonu ve sesli tebrik mesaji duyarsiniz.
4. **Oyun Sonu**: Yeni bir tetromino yerlestirilecek alan kalmadiginda oyun biter ve skorunuz gosterilir. Daha sonra oyun otomatik olarak sifirlanir.

## Dosya Yapisi

```
tetris_game/
├── index.html          # HTML iskeleti ve arayuz
├── styles.css          # Gorunum ve duzenlemeler
├── script.js           # Oyun mantigi ve animasyonlar
└── README.md           # Bu dosya
```

## Katkida Bulunma

Kodu dilediginiz gibi gelistirebilir veya ozellestirebilirsiniz. Ornegin bloklara yeni sekiller ekleyebilir, farkli ses dosyalari kullanabilir veya renk paletini degistirebilirsiniz. Degisikliklerinizi GitHub uzerindeki ilgili depoya gonderirken acik ve anlasilir aciklamalar eklemeyi unutmayin.

Iyi eglenceler!
