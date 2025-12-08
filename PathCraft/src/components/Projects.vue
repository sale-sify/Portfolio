<script setup lang="ts">
    import { ref } from 'vue';

    const scrolled = ref(false);
    function scrollDown() {
        scrolled.value = true;
        window.scrollBy({
            top: window.innerHeight,
            left: 0,
            behavior: 'smooth'
        });
    }
    function toTopPage() {
        scrolled.value = false;
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

</script>





<template>

    <section class="main-container">
        <button class="top-btn" v-if="scrolled" @click="toTopPage">↑</button>
        <div class="title-box item">
            <h2>Projets</h2>
        </div>
        <div class="introduction-box item">
            <h5 class="intro-title">Bienvenue dans mon univers créatif.</h5>
            <p class="intro-txt">
                Je suis un développeur Full stack passionné par les expériences interactives, le design
                intuitif et les interfaces qui racontent quelque chose. À travers mes projets, j’explore
                l’espace où le code rencontre l’imagination : animations, 3D, interactions et concepts expérientiels.
                Chaque projet est une façon d’expérimenter, d’apprendre et de donner vie à des idées.
                Plonge dans mes réalisations, elles parlent mieux que n’importe quel texte.
            </p>
        </div>
        <div class="scrolldown-btn">
            
            <button class="btn-scroll" @click="scrollDown">↓</button>
        </div>
    </section>



    <section class="projet">
        <div class="card">
            <div class="top-card">
                <img class="logo-card" src="../assets/images/logo-todo-manager.png" alt="Logo To-do Manager project">
                <h4 class="title-card">To-do Manager</h4>
                <div class="stack-card">
                    <img class="logo-stack-card" src="../assets/images/vue.png" alt="Logo stack used">
                </div>
            </div>
            <div class="info-card">
                <div class="description-box-card">
                    <p class="description-card">
                        To-Do Manager est une application web simple de gestion de tâches, développée avec Vue 3 et TypeScript.
                        Elle permet aux utilisateurs de créer, modifier et supprimer des tâches, d’attribuer des statuts,
                        et de stocker toutes les données localement dans le navigateur. Le projet a été réalisé comme prototype pour
                        Code2Work.
                    </p>
                </div>
                <div class="picture-box-card">
                    <img src="../assets/images/todo-manager-screenshot.png" alt="">
                </div>
            </div>
            <div class="link-box-card">
                <a class="link-card" href="https://to-do-list-silk-alpha.vercel.app/" rel="noopener noreferrer" target="_blank"> <button class="btn-link-card">Je Decouvre !</button></a>
            </div>
        </div>
    </section>



    <section class="projet">
        <div class="card">
            <div class="top-card">
                <img class="logo-card" src="../assets/images/logo-CRM.png" alt="Logo To-do Manager project">
                <h4 class="title-card">CRM Contact</h4>
                <div class="stack-card">
                    <img class="logo-stack-card" src="../assets/images/angular.png" alt="Logo stack used">
                </div>
            </div>
            <div class="info-card">
                <div class="description-box-card">
                    <p class="description-card">
                        Application CRM modulaire en Angular : gestion complète des contacts et catégories (CRUD),
                        favoris, routing avancé, Reactive Forms typés, services, signals et persistance via localStorage.
                        Architecture modulaire, standalone components, TypeScript strict, ESLint + Prettier.
                    </p>
                </div>
                <div class="picture-box-card">
                    <img src="../assets/images/CRM-screenshot.png" alt="">
                </div>
            </div>
            <div class="link-box-card">
                <a class="link-card" href="https://contact-crm-five.vercel.app/" rel="noopener noreferrer" target="_blank"> <button class="btn-link-card">Je Decouvre !</button></a>
            </div>
        </div>
    </section>



    <section class="projet">
        <div class="card">
            <div class="top-card">
                <img class="logo-card" src="../assets/images/logo-productMan.png" alt="Logo To-do Manager project">
                <h4 class="title-card">Product Man</h4>
                <div class="stack-card">
                    <img class="logo-stack-card" src="../assets/images/react.png" alt="Logo stack used">
                </div>
            </div>
            <div class="info-card">
                <div class="description-box-card">
                    <p class="description-card">
                        Product Man est une application conçue pour gérer une liste de produits. Le backend repose sur Node.js,
                        Express et MongoDB Atlas, tandis que le frontend est développé avec React (Vite) et Material UI. L’interface
                        en mode sombre offre une expérience utilisateur élégante et ergonomique, permettant d’ajouter, modifier,
                        supprimer et afficher via un système de formulaires. 
                        (Screenshot bientot disponible.)
                    </p>
                </div>
                <div class="picture-box-card">
                    <img src="../assets/images/bg-CRM.png" alt="">
                </div>
            </div>
            <div class="link-box-card">
                <a class="link-card" href="https://github.com/sale-sify/Test-LBA" rel="noopener noreferrer" target="_blank"> <button class="btn-link-card">Je Decouvre !</button></a>
            </div>
        </div>
    </section>



    <section class="projet">
        <div class="card">
            <div class="top-card">
                <img class="logo-card" src="../assets/images/logo-eggTimer.png" alt="Logo To-do Manager project">
                <h4 class="title-card">Egg Timer</h4>
                <div class="stack-card">
                    <img class="logo-stack-card" src="../assets/images/javascript.png" alt="Logo stack used">
                </div>
            </div>
            <div class="info-card">
                <div class="description-box-card">
                    <p class="description-card">
                        Le projet Egg Timer est une petite application web ludique réalisée en HTML,
                        CSS et JavaScript, pensée pour allier simplicité et fun. Elle permet de choisir
                        la cuisson idéale, puis lance un compte à rebours animé. Le design coloré et léger
                        donne une touche humoristique à un outil du quotidien.
                    </p>
                </div>
                <div class="picture-box-card">
                    <img src="../assets/images/egg-timer-screenshot.png" alt="">
                </div>
            </div>
            <div class="link-box-card">
                <a class="link-card" href="https://egg-timer-gamma.vercel.app/" rel="noopener noreferrer" target="_blank"> <button class="btn-link-card">Je Decouvre !</button></a>
            </div>
        </div>
    </section>


    <section class="projet">
        <div class="card">
            <div class="top-card">
                <img class="logo-card" src="../assets/images/logo-tickethack.png" alt="Logo To-do Manager project">
                <h4 class="title-card">TicketHack</h4>
                <div class="stack-card">
                    <img class="logo-stack-card" src="../assets/images/javascript.png" alt="Logo stack used">
                </div>
            </div>
            <div class="info-card">
                <div class="description-box-card">
                    <p class="description-card">
                        TicketHack est une application web dynamique développée avec HTML, CSS, JavaScript, Node.js et PostgreSQL.
                        Elle permet de rechercher, filtrer et afficher des trajets de train en temps réel grâce à une
                        interface claire et réactive. Le backend gère les requêtes et la base de données PostgreSQL pour
                        stocker les informations sur les trajets, tandis que le frontend mise sur une expérience fluide
                        et intuitive.
                    </p>
                </div>
                <div class="picture-box-card">
                    <img src="../assets/images/tickethack-screenshot.png" alt="">
                </div>
            </div>
            <div class="link-box-card">
                <a class="link-card" href="https://github.com/sale-sify/Tickethack" rel="noopener noreferrer" target="_blank"> <button class="btn-link-card">Je Decouvre !</button></a>
            </div>
        </div>
    </section>



    <section class="projet">
        <div class="card">
            <div class="top-card">
                <img class="logo-card" src="../assets/images/logo-casse-brique.png" alt="Logo To-do Manager project">
                <h4 class="title-card">Breakout like</h4>
                <div class="stack-card">
                    <img class="logo-stack-card" src="../assets/images/javascript.png" alt="Logo stack used">
                </div>
            </div>
            <div class="info-card">
                <div class="description-box-card">
                    <p class="description-card">
                        Breakout like est, comme son nom l'indique, un jeu type breakout classique,
                        ou il suffit de deplacer une raquette pour faire rebondir une balle et l'envoyer casser des briques.
                        Le jeu a ete cree en JS vanilla, utilisant la balise "canvas" du HTML pour y dessiner et faire intereagir
                        les differents elements du jeu (collision / rebondissement etc...)
                    </p>
                </div>
                <div class="picture-box-card">
                    <img src="../assets/images/screenshot-breakout.png" alt="">
                </div>
            </div>
            <div class="link-box-card">
                <a class="link-card" href="https://js-casse-brique-game.vercel.app/" rel="noopener noreferrer" target="_blank"> <button class="btn-link-card">Je Decouvre !</button></a>
            </div>
        </div>
    </section>
  
</template>





<style scoped>
    .main-container {
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100%;
        box-sizing: border-box;
        background-image: url('../assets/images/bg-img.jpg');
        background-size: cover;
        background-position: center;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        color: rgb(221, 217, 217);
        z-index: -1;
        padding-top: 10%;  
        overflow-y: hidden;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .top-btn {
        position: fixed;
        top: 3.5%;
        right: 2.5%;
        background: rgb(49, 7, 83);
        border: rgba(255, 255, 255, 0.342) 2px solid;
        height: 3rem;
        width: 3rem;
        border-radius: 50%;
        box-shadow: 2px 2px 10px black;
        color: rgb(221, 217, 217);
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        z-index: 100;
    }

    .title-box {
        height: 10%;
        width: 35%;
        text-align: center;
        font-size: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid white;
    }

    .introduction-box {
        width: 50%;
        text-align: center;
        margin: 3%;
        font-size: 1.2rem;
        line-height: 2rem;
    }

    .intro-title {
        font-weight: bold;
        font-size: 1.5rem;
        margin-bottom: 3rem;
    }

    .scrolldown-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 4%;
        font-size: 1.5rem;
    }
    .btn-scroll {
        background: rgb(49, 7, 83);
        border: rgba(255, 255, 255, 0.342) 2px solid;
        height: 5rem;
        width: 5rem;
        border-radius: 50%;
        box-shadow: 2px 2px 10px black;
        margin-top: 2rem;
        color: rgb(221, 217, 217);
        font-size: 2rem;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        position: fixed;
        bottom: 4%;
    }
    button:hover {
        color: white;
        background: rgba(57, 4, 100, 0.815);
        box-shadow: 0px 0px 5px 3px rgb(102, 102, 102);
        border-color: rgba(255, 255, 255, 1);
        transform: scale(1.05);
    }


    .item {
        opacity: 0;
        transform: translateY(-50px);
        animation: slideDown 1s ease-out forwards;
    }

    .item:nth-child(1) {
        animation-delay: 0.3s;
    }
    .item:nth-child(2) {
        animation-delay: 0.6s;
    }
    .item:nth-child(3) {
        animation-delay: 0.8s;
    }
    

    @keyframes slideDown {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }






    .projet {
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100%;
        box-sizing: border-box;
        background-image: url('../assets/images/bg-img.jpg');
        background-size: cover;
        background-position: center;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        display: flex;
        align-items: center;
    }

    .card {
        background: rgba(62, 9, 78, 0.637);
        box-shadow: 0px 1px 16px black;
        backdrop-filter: blur(5px);
        border-radius: 20px;
        width: 65%;
        height: 55%;
        margin: auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        color: rgb(221, 217, 217);
        margin-bottom: 11.5%;
    }

    .top-card {
        display: flex;
        align-items: center;
        width: 97%;
        gap: 5rem;
        font-size: 2rem;
    }
    .top-card > .title-card {
        flex-grow: 1;
        text-align: center;
        width: 55%;
        text-decoration: underline;
        text-underline-offset: 8px;
        font-size: 1.5rem;
    }
    .top-card > img {
        width: 10%;
        border-radius: 10px;
        box-shadow: 0px 1px 16px black;
        border: 2px solid rgba(255, 255, 255, 0.479);
        background: rgb(86, 46, 139);
    }
    .logo-stack-card {
        height: auto;
        width: 13%;
        max-width: fit-content;
        border-radius: 10px;
        box-shadow: 0px 1px 16px black;
        background: rgba(51, 21, 90, 0.63);
        padding: 1rem;
        position: relative;
        top: 3%;
        margin-left: 70%;
    }
    .logo-stack-card > img {
        height: 80%;
        width: 80%;
    }

    .info-card {
        width: 95%;
        height: 45%;
        display: flex;
        align-items: center;
        line-height: 2rem;
        font-size: 1.2rem;
        margin-top: 2%;
        font-size: 1rem;
    }

    .description-box-card {
        width: 60%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 2rem;
        border-right: 2px solid rgba(255, 255, 255, 0.479);
    }
    .picture-box-card {
        width: 40%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 2rem;
    }
    .picture-box-card > img {
        width: 100%;
        height: auto;
        border-radius: 10px;
        box-shadow: 0px 1px 16px black;
        border: 2px solid rgba(255, 255, 255, 0.479);
    }
    .btn-link-card {
        background: rgb(49, 7, 83);
        border: rgba(255, 255, 255, 0.342) 2px solid;
        height: 3rem;
        width: 10rem;
        border-radius: 10px;
        box-shadow: 2px 2px 10px black;
        color: rgb(221, 217, 217);
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        margin-top: 1rem;
    }


    
</style>