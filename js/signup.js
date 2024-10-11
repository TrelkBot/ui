// const AUTH_URL = 'https://auth.trelk.xyz'


function vincule_account() {
    const token = document.getElementById('_signup_submit')
    // if (!token.value) {
    //     invalidInput('_signup_token', 'Token is required', true)
    //     return
    // }

    window.location = `/login?vincule_account=true&account_token=${token.value}`
}

function signup(token) {

    const password = document.getElementById('_signup_password')
    if (!password.value) {
        invalidInput('_signup_password', 'Password is required', true)
        return
    }



    fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.value, signup_token: token })
    }).then(response => { return response.json() })
        .then(data => {
            if (data.error) {
                if (data.error_type == 'duplicate') {
                    // window.location.href = `//trelk.xyz/login`
                    return

                }
                console.log(data.error)
                return
            }
            console.log(data)
            // window.location.href = `${AUTH_URL}/login`
        })



}


