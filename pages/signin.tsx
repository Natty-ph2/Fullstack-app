import AuthForm from "../components/authForm";
import signin from "./api/signin";

const Signin = () => {
    return <AuthForm mode="signin"/>
}

Signin.authPage = true

export default Signin