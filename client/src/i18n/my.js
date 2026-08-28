/**
 * Myanmar (Burmese) message catalog. Ordered key-for-key with `en.js`.
 *
 * FIRST PASS -- these translations have not yet been reviewed by a native
 * speaker / medical translator. Anything missing here falls back to the English
 * string automatically (see `translate()` in ./index.js), so it is safe to fill
 * this in gradually.
 */
export const my = {
  // --- common / shared ---------------------------------------------------
  "common.save": "သိမ်းမည်",
  "common.saveChanges": "ပြောင်းလဲမှုများ သိမ်းမည်",
  "common.saving": "သိမ်းနေသည်…",
  "common.cancel": "မလုပ်တော့ပါ",
  "common.close": "ပိတ်မည်",
  "common.back": "နောက်သို့",
  "common.confirm": "အတည်ပြုမည်",
  "common.edit": "ပြင်ဆင်မည်",
  "common.working": "လုပ်ဆောင်နေသည်…",
  "common.somethingWrong": "တစ်ခုခု အမှားဖြစ်သွားသည်",
  "common.on": "ဖွင့်",
  "common.off": "ပိတ်",
  "common.never": "မရှိသေးပါ",
  "common.dash": "—",
  "common.optional": "(မဖြည့်လည်းရသည်)",

  // --- roles -----------------------------------------------------------------
  "role.ADMIN": "စီမံခန့်ခွဲသူ",
  "role.DOCTOR": "ဆရာဝန်",
  "role.NURSE": "သူနာပြု",
  "role.RECEPTIONIST": "ဧည့်ကြိုဝန်ထမ်း",
  "role.PATIENT": "လူနာ",

  // --- statuses (appointment / invoice / account / leave) ------------------
  "status.REQUESTED": "တောင်းဆိုထားသည်",
  "status.SCHEDULED": "ချိန်းဆိုပြီး",
  "status.COMPLETED": "ပြီးစီး",
  "status.CANCELLED": "ပယ်ဖျက်ပြီး",
  "status.DECLINED": "ငြင်းပယ်ပြီး",
  "status.NO_SHOW": "မလာရောက်ပါ",
  "status.UNPAID": "မပေးရသေး",
  "status.PARTIAL": "တစ်စိတ်တစ်ပိုင်း ပေးပြီး",
  "status.PAID": "ပေးချေပြီး",
  "status.ACTIVE": "အသုံးပြုနေဆဲ",
  "status.INACTIVE": "ရပ်ဆိုင်းထားသည်",
  "status.PENDING": "စောင့်ဆိုင်းဆဲ",
  "status.APPROVED": "ခွင့်ပြုပြီး",
  "status.WITHDRAWN": "ပြန်လည်ရုပ်သိမ်းပြီး",

  // --- navigation / shell -------------------------------------------------
  "nav.dashboard": "ပင်မစာမျက်နှာ",
  "nav.patients": "လူနာများ",
  "nav.bookings": "ချိန်းဆိုမှုများ",
  "nav.leave": "ခွင့်",
  "nav.billing": "ငွေတောင်းခံလွှာ",
  "nav.users": "ဝန်ထမ်းအကောင့်များ",
  "nav.myBookings": "ကျွန်ုပ်၏ ချိန်းဆိုမှုများ",
  "nav.book": "ချိန်းဆိုရန်",
  "nav.myBills": "ကျွန်ုပ်၏ ငွေတောင်းခံလွှာ",
  "nav.doctors": "ကျွန်ုပ်တို့၏ ဆရာဝန်များ",
  "layout.openNav": "မီနူးဖွင့်ရန်",
  "layout.logOut": "ထွက်မည်",

  // --- notice bell -----------------------------------------------------------
  "notice.title": "အသိပေးချက်များ",
  "notice.allCaught": "အသစ်မရှိပါ။",
  "notice.unread": "မဖတ်ရသေး။ ",
  "notice.new": "အသစ် {count} ခု",

  // --- theme control -------------------------------------------------------
  "theme.groupLabel": "အရောင်အပြင်အဆင်",
  "theme.light": "အလင်း",
  "theme.dark": "အမှောင်",
  "theme.system": "စက်အလိုက်",

  // --- login page --------------------------------------------------------
  "login.tagline": "ကင်ဆာစောင့်ရှောက်မှု တစ်စုတစ်စည်းတည်း — လူနာမှတ်တမ်း၊ ချိန်းဆိုမှုနှင့် ငွေတောင်းခံမှုများ တစ်နေရာတည်းတွင်။",
  "login.signInToContinue": "ဆက်လက်ရန် ဝင်ရောက်ပါ",
  "login.createYourAccount": "လူနာအကောင့် ဖွင့်ပါ",
  "login.email": "အီးမေးလ်",
  "login.password": "စကားဝှက်",
  "login.signIn": "ဝင်ရောက်မည်",
  "login.signingIn": "ဝင်ရောက်နေသည်…",
  "login.newPatient": "လူနာအသစ်လား?",
  "login.createAccount": "အကောင့်ဖွင့်မည်",
  "login.haveAccount": "အကောင့်ရှိပြီးသားလား?",
  "login.fullName": "အမည်အပြည့်အစုံ",
  "login.confirmPassword": "စကားဝှက် အတည်ပြုပါ",
  "login.dob": "မွေးသက္ကရာဇ်",
  "login.sex": "လိင်",
  "login.sexFemale": "အမျိုးသမီး",
  "login.sexMale": "အမျိုးသား",
  "login.sexOther": "အခြား",
  "login.phone": "ဖုန်း",
  "login.creatingAccount": "အကောင့်ဖွင့်နေသည်…",
  "login.loginFailed": "ဝင်ရောက်၍ မရပါ",
  "login.couldNotCreate": "အကောင့် ဖွင့်၍ မရပါ",
  "login.pwWeak": "ပိုအားကောင်းသော စကားဝှက်ကို ရွေးပါ — အောက်ပါ လိုအပ်ချက်အားလုံး ပြည့်မီရမည်။",
  "login.pwMismatch": "စကားဝှက်များ မတူညီပါ။",
  "login.phoneInvalid": "မှန်ကန်သော ဖုန်းနံပါတ် ထည့်ပါ (ဂဏန်း ၇–၁၅ လုံး)။",
  "login.phoneHint": "မှန်ကန်သော ဖုန်းနံပါတ် ထည့်ပါ၊ ဥပမာ +95 9 123 456 789။",
  "login.demoAccounts": "စမ်းသပ်အကောင့်များ (နမူနာ ဒေတာ)",

  // --- password strength meter ------------------------------------------
  "pw.tooShort": "တိုလွန်းသည်",
  "pw.weak": "အားနည်း",
  "pw.fair": "အသင့်အတင့်",
  "pw.good": "ကောင်း",
  "pw.strong": "အားကောင်း",
  "pw.ruleLength": "အနည်းဆုံး စာလုံး {n} လုံး",
  "pw.ruleLower": "အင်္ဂလိပ် စာလုံးအသေး တစ်လုံး",
  "pw.ruleUpper": "အင်္ဂလိပ် စာလုံးအကြီး တစ်လုံး",
  "pw.ruleNumber": "ဂဏန်း တစ်လုံး",
  "pw.ruleSymbol": "သင်္ကေတ တစ်ခု (!, ?, @, #, …)",
  "pw.ruleDistinct": "ကွဲပြားသော စာလုံး {n} လုံးအထက်",
  "pw.ruleNoRun": "စာလုံးတစ်လုံးတည်း ၃ ကြိမ်ဆက် မထည့်ရ",
  "pw.ruleNotCommon": "အသုံးများသော စကားဝှက် မဟုတ်ရ",

  // --- confirm dialog ---------------------------------------------------
  "confirm.keepIt": "ဆက်ထားမည်",

  // --- profile page ---------------------------------------------------------
  "profile.title": "ကိုယ်ရေးအချက်အလက်",
  "profile.subtitle": "သင့်ဓာတ်ပုံ၊ ဝင်ရောက်မှု အချက်အလက်များနှင့် အက်ပ်၏ အသွင်အပြင်နှင့် ဆက်သွယ်မှုပုံစံ။",

  "profile.photo": "ဓာတ်ပုံ",
  "profile.changePhoto": "ဓာတ်ပုံ ပြောင်းမည်",
  "profile.uploadPhoto": "ဓာတ်ပုံ တင်မည်",
  "profile.uploading": "တင်နေသည်…",
  "profile.remove": "ဖယ်ရှားမည်",
  "profile.photoHint": "JPG, PNG သို့မဟုတ် GIF၊ ၁.၅ MB အထိ။",
  "profile.photoUpdated": "သင့်ဓာတ်ပုံ ပြောင်းလဲပြီးပါပြီ။",
  "profile.photoRemoved": "သင့်ဓာတ်ပုံ ဖယ်ရှားပြီးပါပြီ။",
  "profile.photoNotImage": "ဓာတ်ပုံဖိုင် ရွေးချယ်ပါ။",
  "profile.photoTooBig": "ဓာတ်ပုံ အရွယ်ကြီးလွန်းသည် — ၁.၅ MB အောက် ရွေးပါ။",

  "profile.accountDetails": "အကောင့် အချက်အလက်",
  "profile.fullName": "အမည်အပြည့်အစုံ",
  "profile.email": "အီးမေးလ်",
  "profile.phone": "ဖုန်း",
  "profile.department": "ဌာန",
  "profile.departmentPlaceholder": "ဥပမာ ကင်ဆာဆောင် ၃",
  "profile.address": "နေရပ်လိပ်စာ",
  "profile.role": "ရာထူး",
  "profile.detailsSaved": "သင့်အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ။",

  "profile.notifications": "အသိပေးချက်များ",
  "profile.remindersLabel": "လာမည့် ချိန်းဆိုမှုမတိုင်မီ အီးမေးလ်ဖြင့် သတိပေးပါ။",
  "profile.remindersHint": "ယခုအတွက် စမ်းသပ် ဆက်တင်သာ — အီးမေးလ် ပို့ရန် စနစ်တကယ် မရှိသေးပါ။",
  "profile.remindersOn": "ချိန်းဆိုမှု သတိပေးချက်များ ဖွင့်လိုက်ပါပြီ။",
  "profile.remindersOff": "ချိန်းဆိုမှု သတိပေးချက်များ ပိတ်လိုက်ပါပြီ။",

  "profile.password": "စကားဝှက်",
  "profile.currentPassword": "လက်ရှိ စကားဝှက်",
  "profile.newPassword": "စကားဝှက် အသစ်",
  "profile.confirmPassword": "စကားဝှက်အသစ် အတည်ပြုပါ",
  "profile.changePassword": "စကားဝှက် ပြောင်းမည်",
  "profile.changingPassword": "ပြောင်းနေသည်…",
  "profile.passwordChanged": "သင့်စကားဝှက် ပြောင်းလဲပြီးပါပြီ။",
  "profile.pwWeak": "ပိုအားကောင်းသော စကားဝှက်ကို ရွေးပါ — အောက်ပါ လိုအပ်ချက်အားလုံး ပြည့်မီရမည်။",
  "profile.pwMismatch": "စကားဝှက်အသစ်များ မတူညီပါ။",

  "profile.session": "ဝင်ရောက်မှု",
  "profile.lastSignedIn": "နောက်ဆုံး ဝင်ရောက်ချိန်",
  "profile.sessionNote": "ဤအက်ပ်တွင် ယခု ဝင်ရောက်မှု တစ်ခုတည်းသာ ရှိသည် — ဤနေရာတွင် ထွက်လျှင် သင်အသုံးပြုနေသည့် ဝင်ရောက်မှု ပြီးဆုံးမည်။",

  "profile.appearance": "အသွင်အပြင်",
  "profile.appearanceNote": "ဘေးဘားရှိ ခလုတ်နှင့် အတူတူပင်။ ၎င်းကို အကောင့်တွင်မဟုတ်ဘဲ ဤ browser တွင် သိမ်းထားသဖြင့် စက်တစ်ခုစီ ကွဲပြားနိုင်သည်။",

  "profile.language": "ဘာသာစကား",
  "profile.languageNote": "အက်ပ်တစ်ခုလုံးတွင် သက်ရောက်ပြီး ဤစက်ပေါ်တွင် မှတ်ထားသည်။",
  "profile.languageNeedsReview": "မြန်မာဘာသာပြန်များမှာ ကနဦးမူကြမ်းဖြစ်ပြီး စစ်ဆေးဆဲဖြစ်သည်။",

  "profile.privacy": "ကိုယ်ရေးလုံခြုံမှုနှင့် ဒေတာ",
  "profile.privacySummary": "ဤအကောင့်သည် မိမိ၏ မှတ်တမ်းများကိုသာ မြင်နိုင်သည်။ ဝန်ထမ်းမှတ်တမ်းများကို ဝန်ထမ်းအကောင့် စာမျက်နှာတွင် စီမံခန့်ခွဲသူက မြင်နိုင်ပြီး၊ လူနာ၏ မှတ်တမ်းများကို ဆေးခန်းဝန်ထမ်းများ မြင်နိုင်သည်။ ဤနေရာမှ မည်သည့်အရာမျှ ဆေးခန်းအပြင်သို့ မျှဝေခြင်း မရှိပါ။",
  "profile.downloadData": "ကျွန်ုပ်၏ ဒေတာ ဒေါင်းလုဒ်လုပ်မည်",
  "profile.preparingDownload": "ပြင်ဆင်နေသည်…",
  "profile.dataDownloaded": "သင့်ဒေတာ ဒေါင်းလုဒ် ပြီးပါပြီ။",
  "profile.downloadFailed": "သင့်ဒေတာ ပြင်ဆင်၍ မရပါ။",
  "profile.downloadNote": "သင့်အကောင့် အချက်အလက်နှင့် ၎င်းနှင့် ချိတ်ဆက်ထားသော မှတ်တမ်းများပါဝင်သည့် JSON ဖိုင်။",

  // --- dashboard ----------------------------------------------------------
  "dash.welcome": "ကြိုဆိုပါသည်၊ {name}",
  "dash.today": "ယနေ့ ဖြစ်ပျက်နေသည်များ။",
  "dash.totalPatients": "လူနာ စုစုပေါင်း",
  "dash.scheduledAppointments": "ချိန်းဆိုထားသော ချိန်းဆိုမှုများ",
  "dash.outstandingBalance": "ပေးရန်ကျန် ငွေ",
  "dash.requestsBlock": "သင့်တုံ့ပြန်ချက် စောင့်ဆိုင်းနေသော ချိန်းဆိုမှု တောင်းဆိုချက် {count} ခု။",
  "dash.reviewRequests": "တောင်းဆိုချက်များ ကြည့်ရန်",
  "dash.upcomingAppointments": "လာမည့် ချိန်းဆိုမှုများ",
  "dash.viewAll": "အားလုံး ကြည့်ရန်",
  "dash.noUpcoming": "လာမည့် ချိန်းဆိုမှု မရှိပါ။",
  "dash.colPatient": "လူနာ",
  "dash.colWhen": "အချိန်",
  "dash.colStatus": "အခြေအနေ",
  "dash.patientFallback": "လူနာ #{id}",

  // --- patients list ----------------------------------------------------
  "patients.title": "လူနာများ",
  "patients.register": "လူနာ မှတ်ပုံတင်ရန်",
  "patients.registered": "{name} ကို မှတ်ပုံတင်ပြီးပါပြီ။",
  "patients.searchPlaceholder": "အမည် သို့မဟုတ် ရောဂါဖြင့် ရှာရန်…",
  "patients.noneFound": "လူနာ မတွေ့ပါ။",
  "patients.colName": "အမည်",
  "patients.colAgeSex": "အသက် / လိင်",
  "patients.colDiagnosis": "ရောဂါ",
  "patients.colDoctor": "ဆရာဝန်",
  "patients.colRegistered": "မှတ်ပုံတင်သည့်ရက်",
};
