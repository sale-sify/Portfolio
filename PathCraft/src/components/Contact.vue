<script setup lang="ts">
    import { ref } from 'vue';
    import emailjs from 'emailjs-com';

    const name = ref('');
    const email = ref(''); 
    const message = ref('');
    const sent = ref(false);

    function sendEmail() {
        emailjs.send('service_s3x4z2r', 'template_soili6s', {
            from_name: name.value,
            from_email: email.value,
            message: message.value,
        }, 'Xg7hBo1f1MLoyA2di').then(() => {
            sent.value = true;
            name.value = '';
            email.value = '';
            message.value = '';
        }, (error) => {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
        });
    }
</script>



<template>
    <section class="main-container">

        <form @submit.prevent="sendEmail">
            <div v-if="sent" class="success-message">
                <p>Merci pour votre message ! Je vous répondrai dès que possible.</p>
            </div>
            <div v-else class="form-container">
                <h2>Contactez-moi</h2>
                <div class="form-group">
                    <label for="name">Nom:</label>
                    <input type="text" id="name" v-model="name" required />
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" v-model="email" required />
                </div>
                <div class="form-group">
                    <label for="message">Message:</label>
                    <textarea id="message" v-model="message" required></textarea>
                </div>
                <button type="submit">Envoyer</button>
            </div>
        </form>
    </section>
  
</template>



<style scoped>
    .main-container {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        position: fixed;
        top: 0%;
        box-sizing: border-box;
        background-image: url('../assets/images/bg-img.jpg');
        background-size: cover;
        background-position: center;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: rgb(221, 217, 217);
        z-index: -1;
        padding-top: 10%;  
        overflow-y: scroll;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
    }



    .success-message {
        font-size: 1.5rem;
        text-align: center;
        margin-top: 20%;
    }
    .success-message > p {
        background: #320f5aa2;
        backdrop-filter: blur(5px);
        box-shadow: 4px 4px 24px black;
        padding: 2rem;
        border-radius: 15px;
        animation: alternate-reverse 1s ease-in-out;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        width: 40%;
        height: 100%;
    }

    h2 {
        margin-top: 1rem;
        border-bottom: 1px solid white;
        width: 50%;
        padding: 1%;
    }

    .form-container {
        margin-bottom: 2rem;
        text-align: center;
        width: 90%;
        height: 90%;
        border: 2px solid rgba(255, 255, 255, 0.479);
        padding: 1%;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        gap: 1rem;
        background: rgba(62, 9, 78, 0.637);
        transition: 0.3s ease-in;
        box-shadow: 0px 1px 16px black;
        animation: alternate-reverse 1s ease-in-out;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        width: 90%;
        text-align: left;
    }
    label {
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }
    input, textarea {
        padding: 0.5rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.479);
        font-size: 1rem;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: rgba(76, 26, 122, 0.363);
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
        appearance: none;
        -webkit-appearance: none;
        color: white;
    }
    textarea {
        resize: vertical;
        min-height: 100px;
    }
    input:focus, textarea:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.63);
        box-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
        background-color: rgba(77, 26, 124, 0.563);
    }
    input:-webkit-autofill,
    textarea:-webkit-autofill {
        background-color: rgb(76, 26, 122) !important;
        -webkit-box-shadow: 0 0 0 1000px rgba(60, 18, 99, 0.963) inset !important;
        -webkit-text-fill-color: rgba(246, 243, 248, 0.897) !important;
        border: 1px solid rgba(255, 255, 255, 0.479) !important;   
    }

    button {
        padding: 0.7rem 1.5rem;
        font-size: 1.2rem;
        border: none;
        border-radius: 15px;
        background: none;
        color: white;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    button:hover {
        background-color: #6e4b7a;
    }
    button:active {
        background-color: #553d61e0;
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2);
    }
    @keyframes alternate-reverse {
        0% {
            transform: scale(0.4);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
</style>