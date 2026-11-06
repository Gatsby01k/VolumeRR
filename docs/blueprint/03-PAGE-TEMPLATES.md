# Семейства страниц

Общие Header, Footer, SkipLink и настройки доступны во всех опубликованных семействах. Структурные SVG в design/wireframes показывают сетку и порядок; точные состояния описаны ниже.

## T01 / Home

Задача: Объяснить предложение и дать два сильных следующих действия.

1. Hero: MOVE VALUE. / OPEN MARKETS.; Market Lens справа; Explore markets.
2. Flow Anatomy: инструкция, обработка, подтверждение; отдельные переходы к продуктам.
3. Build the brief: рынки и продукты без персональных полей.
4. Clarity before the first flow: scope, integration, operating conditions.
5. Context CTA и полный footer.

Компоненты: C01, C04, C05, C06, C07, C14, C15, C19, C25, C26, C39.

Состояния: initial, region_selected, brief_populated, motion_reduced, webgl_unavailable.

Mobile: Заголовок переносится по словам; разрез становится горизонтальным; Market Lens идёт сразу после вступления.

Публикация: Нет клиентского logo wall и чисел без EvidenceRecord. Рынки представлены как focus до подтверждения доступности.

## T02 / Product index

Задача: Помочь выбрать направление денег.

1. Короткий hero: One operating flow. / Three connected parts.
2. Три открытые строки Pay-ins, Payouts, Settlement: задача, результат для обсуждения, ссылка.
3. Разделение обязанностей You define / We confirm.
4. FAQ о запуске и интеграции.
5. CTA с возможностью выбрать несколько продуктов.

Компоненты: C01, C05, C06, C20, C24, C25, C26.

Состояния: initial, product_selected, no_confirmed_capability.

Mobile: Строки становятся вертикальными секциями; названия и CTA остаются в начале каждой.

Публикация: Описание результата не содержит несуществующих SLA, цен и автоматических действий.

## T03 / Product detail

Задача: Объяснить конкретный продукт, его контекст и вопросы запуска.

1. Hero с задачей продукта, CTA Add to brief и иллюстративным operating specimen.
2. Операционный путь Scope / Process / Confirm; исключения показаны наравне с нормальным путём.
3. Country links с сохранением productId.
4. Integration scope: поля, события, отчётность.
5. FAQ и предметный CTA по выбранному продукту.

Компоненты: C01, C04, C07, C11, C14, C20, C22, C24, C25, C26.

Состояния: pay_in, payout, settlement, example_pending, brief_added, availability_unverified.

Mobile: Текст -> specimen -> этапы; нет закреплённого canvas. Добавление в бриф доступно рядом с H1.

Публикация: Пример всегда Illustrative flow; денежная сумма и successful status не имитируют реальный платёж.

## T04 / Method catalogue

Задача: Разделить местный контекст и доступность метода через VolumeRail.

1. Hero: The right method starts with the market.
2. Фильтры по стране, типу метода, направлению и текстовому поиску.
3. Открытые строки метода: provider/scheme, страна, категория, context source, VolumeRail status.
4. Раскрытие requirements и ссылка на профиль страны.
5. CTA для неподтверждённого метода.

Компоненты: C01, C05, C08, C10, C11, C30, C25, C26.

Состояния: initial, filtered, no_results, unverified, verified_with_conditions, stale.

Mobile: Фильтры в раскрываемой секции; выбранные значения видны в summary, результаты обычным списком.

Публикация: Источник схемы не является доказательством партнёрства. Логотипы провайдеров показываются только с корректным правом использования.

## T05 / Market / region directory

Задача: Найти рынок и сравнить setup перед обращением.

1. Hero + поиск страны/валюты; region и flow filters.
2. Country rows: код, имя, регион, валюта, статус, Explore и отдельный Compare.
3. Toolbar сравнения до трёх стран.
4. Краткое пояснение разных местных условий.
5. Brief Rail и CTA для Other market.

Компоненты: C01, C04, C08, C09, C10, C13, C14, C30, C25, C26, C39.

Состояния: all, region_preset, filtered, selected_1, selected_2, selected_3, limit_reached, no_results, stale_data.

Mobile: Строки в одну колонку; Compare checkbox отдельно от country link. Region hub имеет собственное вступление и FAQ.

Публикация: Региональные URL не дублируют общий каталог без собственного содержания. Unknown не означает supported.

## T06 / Country profile

Задача: Дать полезный страновой контекст и сформировать предметный brief.

1. Breadcrumb + страна, ISO currency, status, Add country to brief.
2. Country summary: регион, валюта, продукты для обсуждения и дата проверки.
3. Local method landscape с первичными источниками.
4. Flow choices и условия для обсуждения: поля, объём, валюты, подтверждение.
5. Related markets, FAQ, context CTA.

Компоненты: C01, C04, C10, C11, C12, C14, C15, C24, C25, C26, C33, C39.

Состояния: focus_only, verified_partial, verified_full, stale, unsupported_flow, brief_added.

Mobile: Currency code декоративный и не расширяет viewport; все условия идут после краткого summary, кнопка Add доступна рано.

Публикация: Methods market context и VolumeRail availability имеют раздельные записи. Время и лимиты не публикуются без источника.

## T07 / Market comparison

Задача: Сопоставить максимум три рынка по одинаковым критериям.

1. Короткий title и выбранные страны с Remove.
2. Матрица: currency, products, method context, fields to scope, settlement setup, updated date.
3. Явное Unknown/To confirm; источник у подтверждённого факта.
4. Add selection to brief; Edit selection.
5. Empty state с возвратом в Markets.

Компоненты: C01, C08, C10, C13, C14, C30, C25, C26.

Состояния: empty, one_market, two_markets, three_markets, invalid_codes, stale.

Mobile: Матрица группируется по критерию: затем страны с подписанными значениями. Горизонтальный скролл не является единственным способом чтения.

Публикация: Нет рейтинга стран, выдуманной оценки approval и калькулятора прибыли.

## T08 / Industry index

Задача: Показать, какие операционные модели обсуждаются.

1. Hero с понятным объяснением industry eligibility.
2. Открытые отраслевые входы: iGaming и Digital businesses.
3. Общие вопросы: merchant model, target markets, collection, outgoing payments.
4. Ссылка на operating approach.
5. CTA Discuss your business model.

Компоненты: C01, C05, C20, C24, C25, C26.

Состояния: initial, conditional, industry_not_listed.

Mobile: Каждая отрасль - самостоятельная секция с коротким действием, а не горизонтальная карусель.

Публикация: Не заявлять blanket acceptance. Список отраслей управляется подтверждённой EligibilityPolicy.

## T09 / Industry detail

Задача: Связать продукт с конкретным пользовательским и операционным сценарием.

1. Hero отрасли и вопросы операционной модели.
2. Journey: customer instruction -> local payment -> status -> outgoing need / settlement.
3. Три приоритета отрасли без неподтверждённых обещаний.
4. Country-by-flow context и eligible setup.
5. Technical scope, FAQ, industry-prefilled enquiry.

Компоненты: C01, C04, C07, C12, C20, C24, C25, C26.

Состояния: igaming, digital_businesses, eligibility_unknown, requirements_open.

Mobile: Journey читается обычным вертикальным списком; важные условия не прячутся в hover.

Публикация: iGaming не смешивается с video gaming. Юрисдикция, роль мерчанта и допустимость подтверждаются отдельно.

## T10 / Developer hub

Задача: Дать технической команде понятную карту интеграционного разговора.

1. Hero: Build with / a clear contract.
2. Четыре входа: Integration guide, Payment lifecycle, Events, Reconciliation.
3. Один specimen с заметным Illustrative label.
4. Readiness checklist: fields, state model, delivery, records.
5. Request current integration materials / Technical brief.

Компоненты: C01, C04, C21, C22, C20, C25, C26.

Состояния: overview_only, contract_available, materials_requested.

Mobile: Навигация становится компактным содержанием; code specimen прокручивается в собственной области без расширения страницы.

Публикация: Не публиковать вымышленные endpoints, API keys, sandbox URL или псевдо-SDK. API reference включается только из реального контракта.

## T11 / Documentation article

Задача: Структурировать технический материал и держать его версию.

1. Breadcrumb и версия/дата материала.
2. Sidebar с текущим документом и on-page contents.
3. Текст, таблицы и примеры с labels Conceptual или Contract.
4. Секции exceptions, expected next action, records.
5. Предыдущий/следующий документ и Technical enquiry.

Компоненты: C01, C21, C22, C23, C25, C26, C33.

Состояния: conceptual, contract, stale_version, restricted_material, search_empty.

Mobile: Sidebar раскрывается кнопкой; заголовки имеют якоря и корректный scroll offset.

Публикация: Conceptual material никогда не выглядит как production API reference. Статусы из примера не объявляются банковской финальностью.

## T12 / Partners

Задача: Направить провайдера или коммерческого партнёра в правильный scope.

1. Hero Better connected. / Clearly scoped.
2. Типы: payment providers, commercial partners, technology teams.
3. You bring / We align: рынки, методы, модель ответственности, технические материалы.
4. Структура начала сотрудничества.
5. Partner-prefilled enquiry.

Компоненты: C01, C05, C20, C31, C24, C25, C26.

Состояния: provider, commercial, technical, other.

Mobile: Типы партнёров переключаются обычными buttons; все описания доступны клавиатурой.

Публикация: Не предлагать публичный депозит, трейдерский кошелёк или неописанную инвестиционную модель.

## T13 / Company

Задача: Объяснить подход и фактическую организацию проекта.

1. Hero Built around / the flow.
2. Короткий narrative: local context, clear scope, connected records.
3. Operating principles и связь с рынками.
4. Подтверждённые реквизиты и роли; people section только при реальных данных.
5. Trust и Contact.

Компоненты: C01, C05, C19, C20, C25, C26.

Состояния: prelaunch, operating_entity_verified, people_available.

Mobile: Небольшие смысловые секции; нет анимированной corporate timeline без событий.

Публикация: Не выдумывать офисы, сотрудников, основателей, даты запуска, объёмы и лицензии.

## T14 / Operating trust

Задача: Ответить на вопросы due diligence без декоративных сертификатов.

1. Hero Clarity before / the first flow.
2. Operating model: кто отвечает за какой этап и где условия подтверждаются.
3. Evidence rows: scope, owner, source, reviewed date.
4. Data handling / support / incident contact - фактические материалы.
5. Request due-diligence information.

Компоненты: C01, C05, C19, C20, C24, C25, C26.

Состояния: approach_only, evidence_available, expired_evidence, request_required.

Mobile: Evidence rows превращаются в подписанные блоки; source link и дата не исчезают.

Публикация: Отсутствие сертификата не заменяется знаком certified. Проверенные факты и проектные принципы разделены.

## T15 / Resource / story index

Задача: Помочь найти содержательный материал без пустого блога.

1. Короткий hero и фильтр темы.
2. Крупный featured материал и открытый список остальных.
3. Тип, время чтения, дата review и автор/владелец.
4. Related market/product links.
5. Подписка только при реальном сервисе и отдельном согласии.

Компоненты: C01, C05, C23, C30, C25, C26.

Состояния: three_guides, no_published_content, filter_empty, stories_enabled.

Mobile: Featured и список в один столбец; заголовки не обрезаются.

Публикация: Не публиковать пустую ленту и фиктивные даты. Stories index зарезервирован до реального кейса.

## T16 / Editorial article

Задача: Дать полезное объяснение, сохраняющее связь с продуктом.

1. Breadcrumb, title, summary, author/owner, reviewed date.
2. Содержание и body ограниченной ширины.
3. Ссылки на первичные источники и оговорённую область применимости.
4. Related country/product.
5. Context action Build your brief.

Компоненты: C01, C23, C25, C26, C33.

Состояния: published, needs_review, archived.

Mobile: Body 16-18 px и ограниченная мера строки; таблицы преобразуются в читабельные группы.

Публикация: Не выдавать общий материал за юридическую консультацию, прогноз доходности или подтверждение доступности продукта.

## T17 / Commercial brief

Задача: Превратить сохранённый контекст в проверяемое обращение.

1. Purpose и шаги Markets / Products / Business / Review.
2. Одна форма, выбранный контекст и краткое summary.
3. Редактирование секций из Review без потери данных.
4. Отправка с idempotency и конкретными error states.
5. Подтверждение только после durable acceptance.

Компоненты: C01, C14, C15, C16, C17, C27, C28, C29, C26, C39.

Состояния: blank, prefilled, field_error, step_error, review, submitting, accepted, uncertain, retrying, rate_limited, server_error.

Mobile: Сверху progress и краткое summary, затем поля. Sticky tray не перекрывает клавиатуру. Submit в потоке документа.

Публикация: Нет обязательного звонка, загрузки KYC, реквизитов и сохранения email в URL или analytics.

## T18 / Confirmation

Задача: Подтвердить принятие и объяснить дальнейший шаг.

1. Статус Enquiry received только по receipt.
2. Receipt reference и краткое объяснение review.
3. Без обещания срока ответа, пока оно не согласовано.
4. Return to markets / Start another enquiry.
5. При отсутствии receipt - понятная ссылка на форму.

Компоненты: C01, C18, C25, C26, C39.

Состояния: accepted, missing_receipt, uncertain, duplicate_acknowledged.

Mobile: Один компактный столбец; screen reader получает status без повторяющейся анимации.

Публикация: Простое открытие URL не создаёт ложное подтверждение отправки.

## T19 / Support

Задача: Отделить операционное обращение от запроса продаж.

1. Короткий hero и выбор Existing merchant / Integration / Commercial.
2. Проверенные каналы поддержки либо форма support purpose.
3. Reference optional, country optional, короткое описание.
4. Ссылка на реальный status только если он подключён.
5. Понятное объяснение, какие сведения нужны.

Компоненты: C01, C16, C20, C25, C26, C36.

Состояния: channels_verified, form_available, status_unavailable, urgent_instruction.

Mobile: Первое действие видно сразу, формы простые, обязательный телефон не нужен.

Публикация: Не обещать 24/7 или emergency SLA без операционной команды. Секреты и платёжные credentials не принимаются.

## T20 / Legal article

Задача: Предоставить утверждённый документ в устойчивом читаемом шаблоне.

1. Title, effective date, entity/controller.
2. On-page contents и body.
3. История версии/дата изменения при наличии.
4. Контакт ответственной стороны.
5. Cookie preferences для cookie page.

Компоненты: C01, C23, C26, C37.

Состояния: draft_blocked, approved, superseded.

Mobile: Один столбец, доступные якоря и читабельный текст.

Публикация: Layout готов; юридический текст и реквизиты требуют конкретного владельца и утверждения. Фиктивный legal boilerplate не подставляется.

## T21 / Not found

Задача: Вернуть человека в основной путь.

1. Find your flow.
2. Короткое объяснение и Explore markets.
3. Payments и Contact как дополнительные выходы.
4. Стандартный header/footer.
5. Сохранённый brief не удаляется.

Компоненты: C01, C05, C25, C26, C30.

Состояния: unknown_route, removed_content.

Mobile: Основной CTA без лишней графики, native 404 HTTP status.

Публикация: Не редиректить все неизвестные адреса молча на главную.

## T22 / Commercial setup - reserved

Задача: Показать структуру коммерческого предложения, когда она утверждена.

1. Commercial dimensions: markets, methods, volume, operating requirements.
2. Подтверждённые fee items с unit/currency и scope либо scoped proposal.
3. Что включено и что подтверждается отдельно.
4. FAQ и Request a scoped proposal.

Компоненты: C01, C05, C19, C24, C25, C26, C35.

Состояния: reserved, scoped_only, published_pricebook.

Mobile: Строки fee items без сложной горизонтальной тарифной таблицы.

Публикация: Не показывать условные 0%, free или instant. Не публиковать страницу до коммерческого источника.

## T23 / Customer story - reserved

Задача: Показать проверяемый результат конкретного клиента.

1. Согласованные name/logo и контекст.
2. Challenge / setup / outcome.
3. Каждый результат: период, исходная база, метод измерения, ограничение.
4. Комментарий с разрешением владельца.
5. Related product и enquiry.

Компоненты: C01, C05, C19, C23, C25, C26, C34.

Состояния: reserved, approved, withdrawn_permission.

Mobile: Кейс читается как статья; числа не служат декоративными анимированными счётчиками.

Публикация: Кейс публикуется только после разрешения и EvidenceRecord. Никаких анонимных выдуманных историй.

## T24 / Status destination - reserved

Задача: Дать проверенную точку проверки сервиса.

1. Заголовок и ссылка на фактический status service.
2. Если встроен status - источник, scope, updatedAt и stale indicator.
3. Нет данных - прямое пояснение и Support.
4. Стандартный footer.

Компоненты: C01, C10, C25, C26, C30, C36.

Состояния: reserved, external_verified, feed_available, feed_stale, feed_error.

Mobile: Status и время обновления доступны обычным текстом, без обязательного графика.

Публикация: Не рисовать All systems operational до подключения настоящего источника.
