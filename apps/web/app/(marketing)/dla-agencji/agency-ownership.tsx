import { PanelIcon } from "../../panel/panel-icon";
import { PanelNavigationIcon } from "../../panel/panel-navigation-icon";
import styles from "./agency-ownership.module.css";

const leadPermissions = [
  {
    admin: true,
    label: "Czytanie leadów",
    owner: true,
    sales: true,
  },
  {
    admin: true,
    label: "Status, notatki i obsługa",
    owner: true,
    sales: true,
  },
  {
    admin: true,
    label: "Przypisanie właściciela leada",
    owner: true,
    sales: false,
  },
  {
    admin: false,
    label: "Eksport i zarządzanie retencją",
    owner: true,
    sales: false,
  },
] as const;

const ownershipFacts = [
  ["Właściciel danych", "Organizacja klienta"],
  ["Domyślny dostęp agencji", "Brak"],
  ["Warunek dostępu", "Aktywne członkostwo"],
] as const;

const accessLayers = [
  {
    description: "Każda operacja wskazuje dokładną organizację z adresu panelu.",
    label: "Aktywna organizacja",
  },
  {
    description: "Serwer sprawdza użytkownika, członkostwo i wymaganą rolę.",
    label: "TenantContext",
  },
  {
    description: "RLS odcina zasoby innej organizacji niezależnie od aplikacji.",
    label: "Druga warstwa",
  },
] as const;

export function AgencyOwnership() {
  return (
    <section
      aria-labelledby="agency-ownership-title"
      className={styles.section}
      data-agency-ownership
    >
      <div className={`marketing-container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={`wy-kicker marketing-eyebrow ${styles.eyebrow}`}>Granica danych</p>
          <h2 id="agency-ownership-title">
            Lead należy do firmy. <span>Dostęp wynika z roli, nie z wdrożenia.</span>
          </h2>
          <p className={styles.description}>
            Proces może przygotować i opublikować agencja, ale zapytania trafiają do oddzielnej
            organizacji klienta. Role są sprawdzane po stronie serwera, a baza ponownie egzekwuje
            granicę tenanta.
          </p>

          <dl aria-label="Najważniejsze zasady własności danych" className={styles.facts}>
            {ownershipFacts.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className={styles.proof} data-agency-access-proof>
          <figcaption className="wy-sr-only">
            Macierz rzeczywistych uprawnień Owner, Admin i Sales do leadów organizacji klienta.
          </figcaption>

          <div className={styles.organizationHeader}>
            <span aria-hidden="true" className={styles.organizationIcon}>
              <PanelNavigationIcon name="leads" />
            </span>
            <p>
              <small>Aktywna organizacja klienta</small>
              <strong>Kuchnie Nowa Forma</strong>
            </p>
            <span className={styles.tenantStatus}>Tenant klienta</span>
          </div>

          <div className={styles.permissions}>
            <header>
              <div>
                <p>Dostęp do leadów</p>
                <h3>Uprawnienia aktywnych członków</h3>
              </div>
              <span>Owner · Admin · Sales</span>
            </header>

            <table className={styles.permissionsTable}>
              <caption className="wy-sr-only">
                Uprawnienia aktywnych ról organizacji do operacji na leadach
              </caption>
              <thead>
                <tr>
                  <th scope="col">Operacja</th>
                  <th scope="col">Owner</th>
                  <th scope="col">Admin</th>
                  <th scope="col">Sales</th>
                </tr>
              </thead>
              <tbody>
                {leadPermissions.map((permission) => (
                  <tr key={permission.label}>
                    <th scope="row">{permission.label}</th>
                    <PermissionCell allowed={permission.owner} role="Owner" />
                    <PermissionCell allowed={permission.admin} role="Admin" />
                    <PermissionCell allowed={permission.sales} role="Sales" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.agencyBoundary} data-agency-boundary>
            <span aria-hidden="true" className={styles.boundaryIcon}>
              <PanelNavigationIcon name="privacy" />
            </span>
            <div>
              <small>Agencja wdrożeniowa</small>
              <strong>Poza organizacją domyślnie</strong>
            </div>
            <p>
              Samo wdrożenie nie nadaje roli. Dostęp wymaga aktywnego członkostwa w tej konkretnej
              organizacji.
            </p>
          </div>

          <ol aria-label="Warstwy kontroli tenantowej" className={styles.accessLayers}>
            {accessLayers.map((layer, index) => (
              <li key={layer.label}>
                <span>0{index + 1}</span>
                <div>
                  <strong>{layer.label}</strong>
                  <p>{layer.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  );
}

function PermissionCell({ allowed, role }: Readonly<{ allowed: boolean; role: string }>) {
  return (
    <td data-permission={allowed ? "allowed" : "denied"} data-role={role}>
      {allowed ? (
        <span className={styles.allowed}>
          <PanelIcon aria-hidden="true" name="check" />
          <span className="wy-sr-only">Dozwolone</span>
        </span>
      ) : (
        <span className={styles.denied}>
          <span aria-hidden="true">—</span>
          <span className="wy-sr-only">Brak uprawnienia</span>
        </span>
      )}
    </td>
  );
}
