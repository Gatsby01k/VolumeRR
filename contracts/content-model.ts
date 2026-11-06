/** VolumeRail website content contract v1.0. Design handoff, not a payment API. */
export type Locale = 'en' | 'es' | 'pt';
export type FlowId = 'pay_in' | 'payout' | 'settlement';
export type AvailabilityState = 'unverified' | 'available' | 'conditional' | 'unavailable' | 'stale';
export type OperatingModel = 'unverified' | 'infrastructure_with_partners' | 'direct_licensed_processing' | 'orchestration_only';
export type PublicationState = 'draft' | 'editorial_review' | 'approved' | 'published' | 'archived';
export type RegionId = 'asia' | 'latam' | 'africa';
export type EnquiryPurpose = 'merchant' | 'partner' | 'technical' | 'support';
export type CountryId = string;
export type EvidenceId = string;
export type ISODateTime = string;

export interface EvidenceRecord {
  id: EvidenceId; category: 'capability' | 'entity' | 'licence' | 'security' | 'case' | 'metric' | 'method';
  claim: string; sourceUrl?: string; sourceDocumentId?: string;
  scope: string; owner: string; reviewedAt: ISODateTime; validUntil?: ISODateTime;
  publicPermission: boolean; publicationState: PublicationState;
}
export interface OperatingEntity {
  legalName: string; registrationId?: string; jurisdiction: string;
  publicAddress: string; contactEmail: string; privacyContact: string;
  operatingModel: OperatingModel; roles: ResponsibilityRecord[];
  evidenceIds: EvidenceId[]; publicationState: PublicationState;
}
export interface ResponsibilityRecord {
  stage: string; merchantResponsibility: string; volumeRailResponsibility: string;
  partnerResponsibility?: string; conditions: string; evidenceIds: EvidenceId[];
}
export interface AvailabilityRecord {
  state: AvailabilityState; countryId: CountryId; flowId: FlowId; methodId?: string;
  merchantConditions: string[]; providerScope?: string;
  reviewedAt: ISODateTime | null; validUntil?: ISODateTime; evidenceIds: EvidenceId[];
}
export interface MethodRecord {
  id: string; name: string; category: 'instant_bank' | 'bank_transfer' | 'wallet' | 'mobile_money' | 'card' | 'other';
  countryIds: CountryId[]; contextSourceUrls: string[];
  availability: AvailabilityRecord[]; logoAssetId?: string; logoPermissionId?: string;
  contextOnly: boolean; reviewedAt: ISODateTime | null; publicationState: PublicationState;
}
export interface CountryRecord {
  id: CountryId; iso2: string; name: string; region: RegionId;
  currency: string; currencyName: string; timeZone: string;
  marketStatus: 'focus' | 'verified'; overview: string; methodIds: string[];
  availability: AvailabilityRecord[]; setupQuestions: string[];
  reviewedAt: ISODateTime | null; evidenceIds: EvidenceId[]; publicationState: PublicationState;
}
export interface ProductRecord {
  id: FlowId; slug: string; title: string; heroLines: string[]; summary: string;
  stages: FlowStage[]; setupQuestions: string[]; relatedCountryIds: CountryId[];
  evidenceIds: EvidenceId[]; publicationState: PublicationState;
}
export interface FlowStage { id: string; label: string; explanation: string; nextQuestion: string; }
export interface IllustrativeFlow {
  label: 'Illustrative flow'; productId: FlowId; stages: FlowStage[];
  selectedStageId: string; sampleDataContainsPersonalInformation: false;
}
export interface EligibilityPolicy {
  id: string; industryId: string; jurisdictionScope: string[];
  description: string; owner: string; evidenceIds: EvidenceId[]; publicationState: PublicationState;
}
export interface IndustryRecord {
  id: string; title: string; summary: string; operatingQuestions: string[];
  relatedFlowIds: FlowId[]; policyId?: string; publicationState: PublicationState;
}
export interface BriefContext {
  version: '1.0'; marketIds: CountryId[]; flowIds: FlowId[]; otherMarkets: string[];
  marketExploring: boolean; flowExploring: boolean; industryId?: string;
  purpose: EnquiryPurpose; settlementPreference?: 'not_sure' | 'bank' | 'stablecoin' | 'other';
  sourceRoute: string; updatedAt: ISODateTime;
}
export interface EnquiryDraft extends BriefContext {
  requestIdempotencyKey: string; company: string; name?: string; email: string; website?: string;
  partnerType?: 'payment_provider' | 'commercial' | 'technical' | 'other';
  expectedMonthlyAmount?: number; expectedMonthlyCurrency?: string;
  settlementAsset?: string; settlementNetwork?: string; requirements?: string; supportReference?: string;
  privacyAcknowledged: boolean; privacyNoticeVersion: string; marketingConsent: boolean; locale: Locale;
}
export interface EnquiryReceipt {
  kind: 'accepted'; receiptId: string; acceptedAt: ISODateTime; duplicate: boolean;
}
export interface FieldError { field: string; code: string; message: string; }
export type EnquiryResponse =
  | EnquiryReceipt
  | { kind: 'validation_error'; fieldErrors: FieldError[]; }
  | { kind: 'conflict'; code: 'idempotency_payload_mismatch'; }
  | { kind: 'rate_limited'; retryAfterSeconds: number; }
  | { kind: 'unavailable'; retryable: true; };
export interface RouteRecord {
  id: string; path: string; template: string; title: string; locale: Locale;
  indexing: 'index' | 'noindex'; publicationState: PublicationState;
  requiredEvidenceIds: EvidenceId[]; requiredConnections: string[];
  meta: { title: string; description: string; canonicalPath: string; ogAssetId: string; };
}
export interface NavigationItem {
  label: string; href: string; visible: boolean; children?: NavigationItem[];
  requiresConnection?: string;
}
export interface NavigationConfig { items: NavigationItem[]; primaryCta: CtaContext; login?: VerifiedDestination; }
export interface NavigationGroup { label: string; items: NavigationItem[]; }
export interface HeroContent { eyebrow: string; lines: string[]; summary: string; primary: CtaContext; signature: boolean; }
export interface HeadingContent { eyebrow?: string; lines: string[]; level: 1 | 2 | 3; }
export interface CtaContext {
  label: string; href: string; purpose?: EnquiryPurpose; marketIds?: CountryId[]; flowIds?: FlowId[]; industryId?: string;
}
export interface MarketFilterState { q: string; region?: RegionId; flow?: FlowId; methodCategory?: MethodRecord['category']; }
export interface ComparisonModel { countryIds: CountryId[]; criteria: string[]; maxCountries: 3; }
export interface CodeExample { title: string; mode: 'conceptual' | 'contract'; language: string; code: string; contractVersion?: string; }
export interface ArticleRecord {
  id: string; title: string; summary: string; body: string; owner: string;
  reviewedAt: ISODateTime | null; sourceUrls: string[]; publicationState: PublicationState;
}
export interface DocTree { sections: { title: string; items: { id: string; title: string; href: string; }[]; }[]; }
export interface FaqRecord { question: string; answer: string; relatedHref?: string; }
export interface DialogContent { title: string; body: string; }
export interface StatusMessage { kind: 'success' | 'error' | 'info'; text: string; }
export interface EmptyStateContent { title: string; explanation: string; action: CtaContext; }
export interface PartnerType { id: string; label: string; requirements: string[]; }
export interface LocaleConfig { current: Locale; available: { locale: Locale; href: string; }[]; }
export interface BreadcrumbItem { label: string; href?: string; }
export interface SiteIdentity { brand: 'VolumeRail'; entity?: OperatingEntity; contacts: VerifiedDestination[]; }
export interface VerifiedDestination { label: string; url: string; verifiedAt: ISODateTime; public: boolean; }
export interface ApprovedCase {
  id: string; clientName: string; clientPermissionId: string; productIds: FlowId[];
  challenge: string; setup: string; outcome: string; evidenceIds: EvidenceId[];
  publicationState: PublicationState;
}
export interface Pricebook {
  id: string; effectiveAt: ISODateTime; scope: string;
  items: { label: string; currency: string; unit: string; amount?: number; conditions: string; }[];
  publicationState: PublicationState;
}
export interface CookiePolicy {
  version: string; essential: { name: string; purpose: string; lifetime: string; }[];
  optional: { category: 'analytics' | 'marketing'; enabledByDefault: false; vendors: string[]; }[];
}


/** Transport shape: do not send local storage metadata to the server. */
export interface WebsiteEnquiryPayload extends Omit<EnquiryDraft, 'version' | 'updatedAt' | 'privacyAcknowledged' | 'locale'> {
  schemaVersion: '1.0'; privacyAcknowledged: true; locale: 'en';
}

export type CompanionState = 'ready' | 'explore' | 'brief_added' | 'attention' | 'enquiry_received' | 'reduced_static' | 'hidden';
export interface CompanionEvent {
  type: 'market_selected' | 'brief_updated' | 'validation_failed' | 'enquiry_accepted' | 'motion_changed' | 'visibility_changed';
  countryId?: CountryId; receiptAccepted?: true;
}
export interface CompanionPreferences { visible: boolean; motion: 'system' | 'reduced'; }

export interface DesignRouteRecord extends RouteRecord {
  readiness: 'core' | 'review' | 'requires_connection' | 'legal_review' | 'reserved';
  h1: string; primary_cta: string; navigation: boolean;
  publication: 'blocked_until_content_and_claims_review'; ownerGates: string[];
}
