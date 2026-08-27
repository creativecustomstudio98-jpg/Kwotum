import { PanelIcon, type PanelIconName } from "../../panel-icon";

export function IntegrationEmptyState({
  description,
  icon,
  title,
}: Readonly<{
  description: string;
  icon: PanelIconName;
  title: string;
}>) {
  return (
    <div className="integration-empty-state">
      <span aria-hidden="true" className="integration-empty-state__icon">
        <PanelIcon name={icon} />
      </span>
      <span className="integration-empty-state__copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
    </div>
  );
}
