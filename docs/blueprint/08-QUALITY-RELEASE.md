# Проверка качества и выпуск

## Что проверено в этом пакете
Проверяются целостность данных и покрытия, реестры, контраст проектных ролей, TS-контракт, схема обращения и отрисовка PDF/SVG. Макеты являются дизайном. Измеренные показатели production сайта, работающий endpoint и готовая 3D-анимация здесь не заявляются.

## Критерии реализации
1. Путь Home -> Markets -> India/Kenya -> Compare -> Brief -> Enquiry проходит мышью и клавиатурой; выбор не теряется после Back и refresh в пределах сессии.
2. Страна и compare checkbox имеют разные доступные цели. Четвёртый compare даёт сообщение, не удаляет прежний выбор. Clear, no results, invalid URL, stale и unverified отрисованы.
3. Product -> Country -> Contact переносит flowId и countryId. Other market и Not sure yet позволяют закончить brief. Неизвестные сохранённые IDs безопасно удаляются.
4. Форма сохраняет ввод при 422/429/503/timeout. Error summary ссылается на поля. Keyboard focus понятен. Review редактируется по секциям. Маркетинг не обязателен.
5. Double click, retry и повтор после timeout не создают дубликат. При outbox failure receipt остаётся принятой. Нет Received до durable commit. 409 не меняет старое обращение.
6. Прямой вход на confirmation без принятой сессии не показывает фиктивный успех. Логи, URL, analytics и browser storage не содержат PII.
7. Mobile drawer закрывается Escape, возвращает focus, блокирует фон; native scroll восстанавливается. Dropdown не исчезает на пути указателя.
8. При prefers-reduced-motion, user reduced mode, disabled JS для основного content и WebGL loss страницы читаются и навигация работает. Форма имеет серверный/доступный базовый fallback по выбранной реализации.
9. Manta проходит state mapping и скрывается по выбору. Его графика decorative, обратная связь доступна независимо. Он не перекрывает focus, keyboard или cookie controls. Receipt pose вызывается только после accepted.
10. Нигде не появляется неподтверждённый SLA, клиент, licence, performance metric, цена или доступность. Контекст локального метода подписан отдельно от нашей услуги.

## Viewports и доступность
Проверить ширины 320, 375, 390, 768, 1024, 1440 и 1920 px; landscape mobile, safe areas, 200% zoom и 400% reflow. Браузеры из целевой матрицы владельца: современные Chrome/Safari/Firefox/Edge, iOS Safari и Android Chrome. На реальном медленном Android проверить форму, фильтры и optional motion.

Цель WCAG 2.2 AA (S20). Product touch rule 44 px превышает базовый минимум некоторых критериев WCAG. Проверить контраст, name/role/value, headings, focus-visible, skip link, errors, status announcements, dialogs, tables и screen reader. Automated axe помогает найти ошибки; ручная клавиатура и VoiceOver/NVDA обязательны для главных путей.

## Производительность
Цели p75: LCP <=2500 ms, INP <=200 ms, CLS <=0.1 отдельно по mobile/desktop (S21). До полевых данных - lab budget с фиксированным устройством/сетью и отмеченной методикой. Initial JS <=130 KB gzip, CSS <=40 KB, mobile hero <=180 KB, desktop hero <=350 KB, optional experience <=180 KB gzip. Это проектные бюджеты, не результаты измерения. Optional experience при превышении бюджета заменяется статическим poster/event clip.

## Публикация и зависимости
Gate A: actual entity, role, public contacts и legal. Gate B: approved country/flow/method availability и evidence. Gate C: enquiry owner, durable store/outbox, delivery destination, privacy version и retention. Gate D: real technical documentation, credentials/environment routing для соответствующих ссылок. Gate E: customer permission/metrics/pricebook для зарезервированных страниц.

Необязательный route остаётся hidden, пока gate не закрыт. Публичная форма выключена до A+C. Основные редакционные страницы проходят owner review. Дизайн-слоты и модели уже предусматривают эти данные; выдумывать их ради заполнения страницы не нужно.

## Release checklist
Build/typecheck/lint; schema/registry validation; e2e four journeys + error/retry; visual regression core templates and 7 viewports; accessibility; page weight and lab metrics; link/canonical/sitemap/robots; claims/legal review; backups/alert ownership; production smoke test on real destination. Публикация или подключение новой внешней системы требует отдельного решения владельца, когда реализация готова к проверке.
