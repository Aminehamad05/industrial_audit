const BASE_USL = 'http://localhost:3000/';

const api ={
    auth:{
        login : async (username: string, password : string )=>{
            fetch(BASE_USL + '/auth/logme', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
            body: JSON.stringify({
                username,
                password,
            }),
      })

        }
    }
}

export default api;