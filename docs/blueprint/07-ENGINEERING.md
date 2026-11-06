# Контракт реализации

## Архитектура
Рекомендуемая база: Next.js App Router + TypeScript + обычный CSS с tokens; JSON/MDX в Git как начальный источник содержания. Версия пакетов фиксируется lockfile при старте реализации. Это инженерное решение для данного концепта, не утверждение о последней версии. Страницы и статьи серверные. Client islands: menus, filters, compare, Brief Rail, enquiry wizard, cookie/motion preferences и необязательная анимация Manta. Источники S22-S23.

Контент отделён от компонентов и валидируется на build. Слои: content -> domain models -> page templates -> components -> motion adapters. Выбранный flow или market - ID из реестра. Фильтрация начальных четырёх записей локальная; интерфейс данных допускает серверный поиск при росте каталога. Никакого API call на каждый keystroke для этих данных.

## Источники истины
Route manifest содержит 42 route contracts и метаданные. NavigationConfig задаёт только явную навигацию. CountryRecord и MethodRecord раздельны; sourceUrl о локальной схеме не доказывает нашу доступность. AvailabilityRecord с reviewedAt=null остаётся unverified. Просроченная запись получает stale, а не автоматически available. Все цены, лицензии, кейсы и метрики имеют EvidenceRecord.

## Состояние брифа
BriefContext: version, marketIds, flowIds, purpose, sourceRoute, flags exploring. В sessionStorage допускается только allowlist структурного контекста: version, marketIds, flowIds, purpose, marketExploring, flowExploring, industryId, settlementPreference, sourceRoute, updatedAt. otherMarkets, requirements, supportReference, имена, email, website и любые произвольные строки не сохраняются. TTL сессии, сброс по выбору пользователя. Схема проверяется при чтении; неизвестные IDs удаляются с пояснением.

Сравнение максимум 3, brief максимум 10 известных рынков и до 3 other market names. Выбранный marketExploring и конкретные IDs могут сосуществовать только после явного выбора пользователя; UI поясняет, что он также рассматривает другие рынки. FlowExploring аналогично. Браузерные Back/Forward сохраняют нормализованные фильтры.

## Публичное обращение
Проектный endpoint POST /api/enquiries относится только к сайту. Это не платёжный API. JSON-контракт contracts/enquiry.schema.json. Front-end сериализует EnquiryDraft в WebsiteEnquiryPayload: удаляет local version/updatedAt, добавляет schemaVersion=1.0, locale=en, privacyAcknowledged=true. Неотмеченная privacy checkbox не позволяет отправку. marketingConsent по умолчанию false и не нужен для отправки.

Server повторяет всю валидацию. JSON Schema проверяет форму данных, затем registry validator проверяет реальные country, flow, industry, sourceRoute и ISO currency. Тримминг строк и нормализация выполняются до проверки. Отсутствующие optional fields опускаются, пустые строки не превращаются в невалидный website. Допускается любой корректный контактный email, включая freemail. Company может состоять из одного непустого символа. Валюта объёма отделена от предпочтения settlement. Stablecoin preference не является обещанием услуги.

Idempotency: requestIdempotencyKey - UUID, создаётся для логического обращения и сохраняется в памяти до однозначного результата. Сервер атомарно записывает enquiry и durable outbox, затем отвечает 202 с kind=accepted, receiptId, acceptedAt, duplicate=false. Только после этого UI показывает Received. Повтор того же ключа и того же нормализованного payload возвращает ту же receipt с duplicate=true. Тот же ключ с другим payload -> 409 conflict, без второго обращения; UI предлагает review и новую отправку с новым ключом. После validation 422 пользователь может исправить payload, поскольку ключ ещё не принят. При timeout payload замораживается до проверки/безопасного retry. Кнопка Edit в uncertain сначала объясняет необходимость проверить предыдущую отправку.

Доставка уведомления через outbox повторяется отдельно и не удаляет принятую запись. Получатель и CRM подключаются по реальным данным владельца. Численный SLA ответа не придумывается. Политика хранения, локализация данных и доступ команды задаются утверждённым privacy notice. Временный idempotency TTL должен покрывать retry window; проектное значение 24 часа требует утверждения владельцем сервиса.

Ответы: 202 accepted; 422 validation_error + fieldErrors; 409 conflict; 429 rate_limited + Retry-After; 503 unavailable; network/timeout uncertain. Сервер не использует 200 accepted до durable commit. Receipt route noindex, не содержит email/компанию/содержание брифа в URL. Ссылки на чужие receipt не раскрывают PII; отображаемая квитанция привязана к подтверждённой сессии или непрозрачному короткоживущему токену. Хранение контактов в localStorage исключено.

## Защита публичной формы
Same-origin, Origin/CSRF проверка по выбранному transport, server-side validation, ограничение размера тела 16 KB, rate limiting, honeypot в доступно скрытом контейнере. CAPTCHA только по фактическому abuse и с доступной альтернативой. Произвольные HTML, attachments и внешние fetch к website из формы не исполняются. Логи исключают тело обращения и PII. Ошибки сервера имеют safe correlation ID. CSP не включает unnecessary unsafe-eval; шрифты и ассеты same origin.

## Анимация и ассеты
Критическая верстка не ждёт изображения или JS. Hero - HTML/CSS + оптимизированный материал, текст настоящий. 3D/видео и Manta загружаются после LCP/intent, отдельно от навигации. Статический poster доступен сразу. Бюджет optional module 180 KB gzip, включая runtime/model; при превышении использовать pre-rendered event clips. Размеры всех media заданы. next/image или аналогичная responsive pipeline, AVIF/WebP, lazy для below-fold. Шрифты из пакета, браузеру WOFF2, не TTF.

## SEO и аналитика
Metadata title, description, canonical и OG создаются из route record. У каждой опубликованной страницы один H1. Sitemap только published/index. JSON-LD Organization требует фактической entity, Article - автора/дату/источники. FAQ schema не добавляется ради расширенного сниппета. Пустые зарезервированные маршруты не публикуются и не индексируются.

Allowed events см. contracts/analytics.json. Conversion enquiry_accepted срабатывает после durable receipt, один раз на логическое обращение. Поля формы, свободный поиск, contact values, otherMarkets и supportReference не идут в event props. Сессионая запись на формах выключена. Optional analytics запускается по действительной настройке согласия, где она требуется.

## Предлагаемая структура проекта
app/(public) - маршруты; content - JSON/MDX; components - C01-C39; lib/domain - schema/registry/brief; lib/server - enquiry transaction/outbox; styles/tokens.css; public/brand; public/fonts. Реализация начинается с токенов и shell, затем типовых блоков, market journey и формы, потом motion. Прежний Sites checkout не используется как production-основание.

## Purpose-specific form branches
Merchant использует все четыре шага. Partner начинает с partner type, затем business/review; markets optional. Technical может указать рынки и продукты либо перейти к question/business/review. Support использует company/email/reference/question и review без обязательного выбора рынка/продукта. Схема требует непустой market/flow выбор или exploring flag только для merchant. Неприменимые поля не заставляют пользователя выбирать Not sure.
