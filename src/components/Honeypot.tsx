/** Hidden bot trap: invisible to people and screen readers; read by guardFields() in src/lib/formGuard.ts. */
export default function Honeypot() {
  return <input type="text" name="website" data-hp="1" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />;
}
