import { googleLogout } from "@react-oauth/google";

const clientId = "1085235594152-36ckcmfjakumr7t4m93f9i3joe2vla7b.apps.googleusercontent.com";

function Logout() {

    const onSuccess = () => {
        console.log("Log out successfull!");
    }

    return(
        <div id = "signOutButton">
            <googleLogout
            clientId = {clientId}
            buttonText = {"Logout"}
            onLogoutSuccess = {onSuccess}
            />
        </div>
    )
}
export default Logout;