import { passwordRules } from '../features/auth/schemas';

export default function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="rules" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const met = rule.test(value);
        return (
          <li key={rule.id} className={met ? 'met' : undefined}>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
