import { useNavigate } from "react-router-dom";
import MemberForm from "./form";

export default function MemberCreatePage() {
  const navigate = useNavigate();

  return (
    <MemberForm
      onCreated={() => {
        navigate("/dashboard/members");
      }}
    />
  );
}
