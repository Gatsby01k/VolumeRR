# Архитектура сайта и пути пользователя

В карте 42 маршрута: 37 основных/планируемых и 5 зарезервированных. Это объём системы, не количество страниц, уже допущенных к публикации. Поле readiness и ownerGates управляют выпуском.

## Навигация
В шапке пять входов: Payments, Markets, Industries, Developers, Company. Основной CTA: Discuss your flow. Products и Markets имеют доступные подменю. Partners, Operating approach, Resources и Support доступны через Company и footer. Login появляется только при реальном проверенном адресе.

Footer содержит продукты, три региона, developer/company/help и legal. Cookie preferences, Motion preferences и Show/Hide Manta являются отдельными кнопками настроек, а не фиктивными ссылками.

## Путь 1: merchant от страны до обращения
Home -> Markets -> India/Kenya -> Compare -> Add to brief -> Contact / Markets -> Products -> Business -> Review -> accepted receipt. Выбранные IDs сохраняются между страницами. Четвёртая страна не вытесняет одну из трёх в сравнении.

## Путь 2: merchant от продукта
Home или Payments -> Payouts -> Flow Anatomy -> Country profile -> brief. ProductId переносится в дальнейший CTA. Доступность остаётся видна отдельно от общего описания продукта.

## Путь 3: техническая команда
Developers -> Integration guide -> Lifecycle/Webhooks/Reconciliation -> Technical enquiry. Публичные статьи являются planning guidance. API credentials, sandbox и точные endpoints появляются только из утверждённого контракта.

## Путь 4: партнёр или существующий контакт
Company -> Partners -> partner type -> brief либо Support -> enquiry reference -> support purpose. Новый посетитель не должен угадывать, куда писать. Референс безопасно передаётся в теле формы, не через публичный URL.

## URL, индексирование и масштабирование
Английский язык в корне. Будущие локали получают явный префикс и hreflang только после перевода. Принудительного IP redirect нет. Canonical у фильтров ведёт к чистому каталогу; сравнение, contact и receipt закрыты noindex. В sitemap попадают только опубликованные indexable записи.

Разрешённые параметры каталога: region, flow, methodType, q. Для сравнения codes содержит до трёх ISO2 из реестра; порядок нормализуется. Search q ограничен длиной и не передаётся в аналитику. Любой URL-параметр недоверенный; произвольный redirect не поддерживается. Никаких имён, email и свободного текста в URL.

Новые CountryRecord и MethodRecord используют те же шаблоны; 4 рынка не зашиты в JSX. Редакционный формат и статья имеют собственный URL. Региональный hub содержит отдельный контекст и FAQ, а не копию общего каталога.

## Полная карта
| URL | Шаблон | Статус | Robots |
| --- | --- | --- | --- |
| / | T01 | core | index |
| /payments | T02 | core | index |
| /payments/pay-ins | T03 | core | index |
| /payments/payouts | T03 | core | index |
| /payments/settlement | T03 | core | index |
| /payments/methods | T04 | core | index |
| /markets | T05 | core | index |
| /markets/asia | T05 | core | index |
| /markets/latam | T05 | core | index |
| /markets/africa | T05 | core | index |
| /markets/india | T06 | core | index |
| /markets/peru | T06 | core | index |
| /markets/ghana | T06 | core | index |
| /markets/kenya | T06 | core | index |
| /markets/compare | T07 | core | noindex |
| /industries | T08 | review | index |
| /industries/igaming | T09 | review | index |
| /industries/digital-businesses | T09 | review | index |
| /developers | T10 | core | index |
| /developers/integration-guide | T11 | core | index |
| /developers/payment-lifecycle | T11 | core | index |
| /developers/webhooks | T11 | review | index |
| /developers/reconciliation | T11 | core | index |
| /partners | T12 | core | index |
| /company | T13 | review | index |
| /trust | T14 | review | index |
| /resources | T15 | review | index |
| /resources/local-payment-methods | T16 | review | index |
| /resources/pay-ins-vs-payouts | T16 | core | index |
| /resources/settlement-readiness | T16 | review | index |
| /contact | T17 | requires_connection | noindex |
| /contact/confirmation | T18 | requires_connection | noindex |
| /support | T19 | requires_connection | index |
| /legal/privacy | T20 | legal_review | index |
| /legal/cookies | T20 | legal_review | index |
| /legal/terms | T20 | legal_review | index |
| /404 | T21 | core | noindex |
| /developers/api-reference | T11 | reserved | noindex |
| /status | T24 | reserved | noindex |
| /customer-stories | T15 | reserved | noindex |
| /customer-stories/[slug] | T23 | reserved | noindex |
| /pricing | T22 | reserved | noindex |
