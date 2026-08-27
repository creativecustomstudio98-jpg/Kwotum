import { OrganizationPickerFrame } from "./organization-picker-frame";

export default function OrganizationPickerLoading() {
  return (
    <OrganizationPickerFrame
      busy
      headerAction={<span aria-hidden="true" className="organization-picker__loading-logout" />}
    >
      <div aria-hidden="true" className="organization-list organization-list--loading">
        <div className="organization-list__card organization-list__card--loading">
          <div className="organization-picker__loading-avatar" />
          <div className="organization-picker__loading-copy">
            <span />
            <span />
          </div>
          <div className="organization-picker__loading-meta">
            <span />
            <span />
            <span />
          </div>
          <div className="organization-picker__loading-action" />
        </div>
      </div>
      <p className="wy-sr-only" role="status">
        Wczytujemy organizacje.
      </p>
    </OrganizationPickerFrame>
  );
}
