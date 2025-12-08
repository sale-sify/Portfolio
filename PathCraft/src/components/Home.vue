<script setup lang="ts">

</script>



<template>
    <section class="main-container">
        <div class="title-box">
            <div class="main-title">
                <h1 class="item">Romain Sales</h1>
                <h3 class="item">Développeur Full Stack</h3>
                <p class="item">
                    Ancien professionnel de la restauration, je me reconvertis aujourd’hui dans le développement web.
                    L’objectif est de devenir développeur full-stack et de construire des projets concrets et innovants.
                    Je débute également un Bachelor en alternance à l’ETNA, et je suis à la recherche d’une entreprise où je
                    pourrai apprendre, contribuer et grandir en tant que développeur.
                </p>
            </div>
            <div class="logo item">
                <img src="../assets/images/logo.png" alt="Logo PathCraft">
            </div>
        </div>

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
        overflow-y: auto;
    }

    .title-box {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        height: 80%;
        width: 60%;
        margin: auto;
        margin-top: 2%;
        text-align: center;
    }

    .main-title h1 {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    .main-title h3 {
        font-size: 2rem;
        margin-bottom: 2rem;
    }
    .main-title p {
        font-size: 1.2rem;
        line-height: 1.5;
    }

    img {
        width: 40%;
        height: auto;
        margin-top: -30px;
        transition: 0.3s ease-in; 
    }
    img:hover {
        transform: scale(1.1);
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
    .item:nth-child(4) {
        animation-delay: 1s;
    }

    @keyframes slideDown {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }



    @media (max-width: 768px) {
        
        .main-container {
            padding-top: 50%;  
            
        }
        .title-box {
            width: 90%;
        }
        .main-title h1 {
            font-size: 2.5rem;
        }
        .main-title h3 {
            font-size: 1.5rem;
            margin-bottom: 4rem;
        }
        .main-title p {
            font-size: 1rem;
        }
        img {
            width: 60%;
            margin-top: 2rem;
        }
        
    }
</style>
