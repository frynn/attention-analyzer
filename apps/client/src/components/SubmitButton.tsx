import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  label: string;
  pendingLabel: string;
}

export default function SubmitButton({ label, pendingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full py-2 rounded bg-sage-500 text-forest-950 hover:bg-sage-400 disabled:opacity-50 font-medium transition"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
