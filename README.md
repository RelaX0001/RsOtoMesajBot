Merhaba Dostum Uzun Bir Aradan Sonra Yine Karşılaştık :)
Boş Vakitlerimde Uğraşıp Yazdığım Bu Telegram Reklam Botundan Biraz Bahsedeyim.

ℹ️ Bu Bot Reklam Paneli, Telegram Hesabınız Üzerinden Tam Otomatik Mesaj İletimi Yapabilmeniz İçin Özenle Tasarlandı.

❇️ Aşağıdaki Butonları Kullanarak Tüm Ayarlarınızı Kolayca Yönetebilir, Reklamlarınızı İstediğiniz Gruplara Saniyeler İçinde Yönlendirebilirsiniz.

✨ Neler Yapabilirsiniz?

📍 Reklam Mesajlarınızın Alınacağı Kaynak Grubu Seçebilirsiniz.
🎯 Reklamların Gönderileceği Hedef Grupları Belirleyebilirsiniz.
⏱ Reklam Mesajlarınızın Gönderim Aralığını Yönetebilirsiniz.
📨 Sabit Veya Gruptaki Son Mesaj Modları Arasında Geçiş Yapabilirsiniz.
⚙ Gelişmiş Ayarlarla Tam Kontrol Sağlayabilirsiniz.
📜 Log Kayıtlarını Anlık İnceleyebilirsiniz.
🧪 Test Gönderimi Yaparak Sistemin Çalıştığını Doğrulayabilirsiniz.

🚀 Her Şey Sizin İçin Kolay, Hızlı Ve Zahmetsiz Olacak Şekilde Tasarlandı.

===================
- - - KURULUM - - -
===================

Öncelikle [nodejs_indirici.bat] Dosyamızı Sağ Tıklayıp Yönetici Olarak Çalıştır Diyoruz. Bu İşlem Sisteminizde Node.js Yok İse Yükleyip Otomatik Kuracaktır.

Ardından [kutuphane_yukleyici.bat] Dosyamızı Sağ Tıklayıp Yönetici Olarak Çalıştır Diyoruz. Bu İşlem İse Bize Gerekli Kütüphaneleri Yükleyecektir.

==================================================================================================================

Evet Şimdi İse Şöyle Yapıyoruz.

[https://my.telegram.org/] Adresine Gidiyoruz. Your Phone Number Yazan Yere,

Reklam Hesabı Olarak Kullanacağımız Telegram Hesabımızın Telefon Nuamrasını Giriyoruz.

Ardından Aşağıdaki [Sıgın In] Butonuna Basıyoruz.

Sonra O Butonun Üzerinde [Confirmation code] Yazan Bir Yer Geliyor. Oraya Telegram Uygulamasından Hesabımıza Telegram Tarafından Gönderilen Kodu Yazıp,
Tekrardan [Sıgın In] Butonuna Basıyoruz.

Sonra Karşımıza Şöyle Bir Yer Geliyor.

[Your Telegram Core]
[API development tools]
[Delete account]
[Log out]

Bunlardan 1. Olanı Yani [API development tools] Yazana Basıyoruz. Sonra Karşımıza Böyle Bir Yer Geliyor.

[Create new Application]

[App title: ]

[Short name:]

[URL: ]

Buraları İstediğiniz Gibi Doldurup Aşşağıdaki [Saving...] Butonuna Basınız.

Sonra Karşımıza Gelen Ekranda,

App api_id: 23******
App api_hash: 8a7654a*************************

Bu Şekilde Değerler Olucak Bunları Alıp .env Dosyamızdaki,

TELEGRAM_API_ID=23******
TELEGRAM_API_HASH=8a7654a*************************

Yerlerine Örnekteki Gibi Yazacaksınız.

==================================================================================================================

Sonra Telegramda Reklam Yapmak İstediğimiz Hesabımıza Girip,

[https://t.me/BotFather] Botunu Başlatınız. 

Sonra Gelen Mesajdan Sonra.

[/newbot] Komutunu Yazınız.

Ardından Gelen Soruda Botunuzun İsmi Ne Olsun Diye Soruyor. Rastgele Bir Şey Diyebilirsiniz.

Sonra Botunuzun Kullanıcı Adı Ne Olsun Diye Soruyor. Onada Rastgele Bir Şey Yazın Fakat [Sonu Bot İle Bitmek Zorunda.]

Sonra Şöyle Bir Mesaj Alıyoruz.

Done! Congratulations on your new bot. You will find it at [t.me/rsreklambot]. 
You can now add a description, about section and profile picture for your bot,
see /help for a list of commands. By the way, when you've finished creating your cool bot,
ping our Bot Support if you want a better username for it. Just make sure the bot is fully operational before you do this.

Use this token to access the HTTP API:
8202******:AAE8p1hx2lbGx**********************
Keep your token secure and store it safely, it can be used by anyone to control your bot.

For a description of the Bot API, see this page: https://core.telegram.org/bots/api

Bu Mesajdan Sonra İşlemimiz Bitti.

8202******:AAE8p1hx2lbGx**********************

Bu Yarısını Bulurladıgım Şey Bizim Botumuzun Tokeni, Bunu Alıp .env Dosyasındaki.

TELEGRAM_BOT_TOKEN=8202******:AAE8p1hx2lbGx**********************

Yerine Örnekteki Gibi Yazıyoruz.

==================================================================================================================

Sonra Telegramda Aynı BotFatherde Olduğu Gibi Şimdide https://t.me/raw_data_bot a Gidip Start Veriyoruz.

O Sonra Size Mesaj Olarak 

@raw_data_bot botuna hoş geldiniz!

Yardım: /help

Bot haberleri: @idbotnews

Not: Kimliğiniz: 77728****

Şeklinde ID Değerinizi Atıyor Bu Değeride Alıp .env Deki 

BOT_OWNER_ID=77728****

Yerine Örnekteki Gibi Yazıyoruz.

Evet İşlemlerimiz Bitti.

Sonuç Olarak .env Dosyamız Örnekteki Gibi Gözükecektir.

TELEGRAM_API_ID=23******
TELEGRAM_API_HASH=8a7654a*************************
TELEGRAM_BOT_TOKEN=8202******:AAE8p1hx2lbGx**********************
BOT_OWNER_ID=77728****
DEFAULT_INTERVAL_MINUTES=1

==================================================================================================================

Şimdi Gelelim Botumuza Start Verelim [t.me/rsreklambot]. BotFather'den Oluşturduğumuz Botumuz Buydu. Siz Kendi Oluşturduğunuza Start Vericeksiniz.

Evet Şimdi İse Botumuzun Dosyalarının Ana Dizininde Cmd Ekranı Açıyoruz. O Dizinde Olmamız Gerekli.

Sonra Açılan Cmd Ekranına Şu Komutu Yazıyoruz.

npm run init-session

Sonra Gelen Sorulara Cevap Veriyoruz.

? 📞 Telegram Hesabınıza Bağlı Telefon Numaranızı, Örnekteki Gibi Giriniz. [+90 555 444 33 22]:+90 234 453 45 43

Şeklinde Sonra Enter Tuşuna Basıp Devam Ediyoruz.

Sonra Gelen Soruda Hesabımıza Telegram Tarafından Gönderilen Kodu Yazıp Yine Enter Basıyoruz.

? 🔢 Telegram Hesabınıza Telegram Tarafından Gönderilen Kodu Yazıp Enter Tuşuna Basınız: 47536

Sonra Gelen Soruda Hesabımıza 2Fa Parolası Varsa Eğer Giriyoruz Sonra Enter Basıyoruz. Yoksa Enter Basarak Geçiyoruz.

? 🔒 Hesabınızın 2FA Parolası Varsa Eğer Lütfen Parolayı Giriniz. (Eğer 2Fa Parolanız Yoksa Enter Tuşuna Basarak Geçebilirsiniz): 444324

Sonra Bir Hata Yapmadıysanız Ekranda Size

✅ Oturumunuz Başarıyla Oluşturuldu Ve Ana Dizine Kaydedildi. Lütfen [session.txt] Dosyanızı Silmeyiniz!

Yazacaktır.

Şimdi İse Son Adımdayız :)

Aynı Ekrana Şimdide 

[Node .]

Komutunu Yazarak Botumuzu Aktif Ediyoruz.

2025-11-30T13:57:39.781Z | ✅ Harika! Her Şey Yolunda Gözüküyor. Botumuz Artık Aktif! Botumuza Gidip [/start] Komutunu Vererek Yönetim Paneline Erişebilirsiniz.
2025-11-30T13:57:39.782Z | 🔁 Reklam Mesajı Döngüsü Başlatıldı.
2025-11-30T13:57:39.783Z | ⛔ Pasif Veya Eksik Ayarlar Algılandı. Lütfen Bot Üzerinden Yöneterek Ayarlayınız.
2025-11-30T13:57:39.791Z | ⏳ Reklam Arası Bekleme Süresi (Ms): 60000

Boyle Bir Sonuç Alırsak Her Şey Yolunda Demektir. Şimdi İse Botumuza Gidip [/start] Komutunu Vererek Yönetim Paneline Erişebiliriz. Orada Herşey Gayet Açık Ve Net Anlatmama Gerek Yok Baya Yoruldum Yazarken Umarım Anlaşılır Olmuşumdur.

Okuduğun İçin Teşekkür Ederim. Kendine İyi Bak Sağlıcakla Kal Dostum.

===================
- - - DESTEK - - -
===================

Discord Hesabım: @devrelax
Discord Sunucumuz: https://discord.com/invite/WfPtUUkc7C
Telegram Hesabım: https://t.me/relaxbey
Telegram İnfo Kanalımız: https://t.me/relax_services
Telegram Sohbet Grubumuz: https://t.me/relaxserviceschat
İnstagram Hesabımız: https://www.instagram.com/dev.relax/
