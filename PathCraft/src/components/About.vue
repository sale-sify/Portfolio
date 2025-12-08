<script setup lang="ts">

</script>



<template>
    <section class="main-container">
        <div class="title-box">
            <h2 class="title">Mon Parcours</h2>
        </div>
        <div class="formation">
            <div class="exp-item">
                <h5 class="exp-title">Manager en Restauration</h5>
                <p class="exp-date">2015 - 2024</p>
                <p class="exp-description">
                    Supervision opérationnelle et pilotage d’équipe dans un environnement à forte cadence.
                    Gestion de problématiques en temps réel, optimisation des process, communication claire
                    et priorisation rapide.  
                </p>
            </div>
            <img src="../assets/images/arrow.png" alt="">
            <div class="exp-item">
                <h5 class="exp-title">La Capsule</h5>
                <p class="exp-date">2025</p>
                <p class="exp-description">
                    Formation intensive en conception et développement d’applications web et mobile, ainsi que
                    création de base de données. invention et création de projets d’application web tel que TicketHack.  
                </p>
            </div>
            <img src="../assets/images/arrow.png" alt="">
            <div class="exp-item">
                <h5 class="exp-title">ETNA</h5>
                <p class="exp-date">2025 - 2027</p>
                <p class="exp-description">
                    Bachelor en conception et développement d’application en alternance, réalisation de projets
                    en équipes et apprentissage de frameworks, ainsi que de méthodologie de travail et
                    déploiement de projets.  
                </p>
            </div>
        </div>

        <div class="skills-container">
            <div class="skills-box">
                <h3 class="skils-title">Compétences Acquises</h3>
                <ul class="skills-list">
                    <li class="skill-item">Communication claire</li>
                    <li class="skill-item">Organisation</li>
                    <li class="skill-item">Rigueur et serieux</li>
                    <li class="skill-item">Resolution de problemes</li>
                    <li class="skill-item">Penser utilisateurs</li>
                    <li class="skill-item">Sens du details</li>
                </ul>
            </div>
            <div class="skills-box">
                <h3 class="skils-title">Compétences Acquises</h3>
                <ul class="skills-list">
                    <li class="skill-item">HTML5</li>
                    <li class="skill-item">CSS3</li>
                    <li class="skill-item">JavaScript</li>
                    <li class="skill-item">Node.js</li>
                    <li class="skill-item">PostgreSQL</li>
                    <li class="skill-item">Responsivite / RGA</li>
                    <li class="skill-item">Git / GitHub</li>
                </ul>
            </div>
            <div class="skills-box">
                <h3 class="skils-title">Compétences Acquises</h3>
                <ul class="skills-list">
                    <li class="skill-item">Vue.js</li>
                    <li class="skill-item">React</li>
                    <li class="skill-item">Angular</li>
                    <li class="skill-item">GitLab</li>
                    <li class="skill-item">Linux / bash</li>
                    <li class="skill-item">Docker</li>
                    <li class="skill-item">Figma</li>
                </ul>
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
        overflow-y: scroll;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
    }

    .title-box {
        height: 10%;
        width: 40%;
        text-align: center;
        margin-bottom: 2%;
        font-size: 200%;
        border-bottom: 1px solid white;
        margin-bottom: 3%;
    }

    .formation {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: top;
        width: 85%;
        text-align: center; 
    }

    .exp-item {
        margin-bottom: 2%;
        text-align: center;
        width: 25%;
        border: 2px solid rgba(255, 255, 255, 0.479);
        padding: 1%;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        gap: 0.5rem;
        font-size: 100%;
        background: rgba(62, 9, 78, 0.637);
        transition: 0.3s ease-in;
        box-shadow: 0px 1px 16px black;
    }
    .exp-item:hover {
        background: #320f5aa2;
        backdrop-filter: blur(5px);
        box-shadow: 4px 4px 24px black;
        border-color: rgba(255, 255, 255, 1);
    }
    .exp-title {
        width: 70%;
        font-size: 120%;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid white;
        padding-bottom: 5px;
    }
    .exp-date {
        font-size: 80%;
        font-style: italic;
    }
    img {
        width: 5%;
        height: 100px;
        margin: 2%;
        margin-top: 4%;
    }

    .skills-container {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: top;
        width: 85%;
        margin-bottom: 5%;
        gap: 9.5%;
    }
    .skills-box {
        width: 25%;
        border: 2px solid rgba(255, 255, 255, 0.479);
        padding: 1%;
        gap: 5rem;
        border-radius: 20px;
        background: rgba(62, 9, 78, 0.637);
        box-shadow: 0px 1px 16px black;
        transition: 0.3s ease-in;
        
    }
    .skills-box:hover {
        background: #320f5aa2;
        backdrop-filter: blur(5px);
        box-shadow: 4px 4px 24px black;
        border-color: white;
    }
    
    .skils-title {
        width: 60%;
        font-size: 1.2rem;
        margin: auto;
        margin-bottom: 0.5rem;
        border-bottom: 1px solid white;
        padding-bottom: 5px;
        text-align: center;
    }

    .skill-list {
        width: 70%;
        margin: auto;
        text-align: center;
        list-style-type: none;
        padding: 0;
        margin: 0;
        margin-right: 1rem;
        gap: 0.5rem;

    }
    .skill-item {
        margin-right: 2rem;
        text-decoration: none;
        font-size: 1rem;
        text-align: center;
        list-style-type: none;
    }




    .exp-item {
    opacity: 0;
    transform: translateX(-50px);
    animation: slideRight 1s ease-out forwards;
    }

    .exp-item:nth-child(5) { animation-delay: 0.3s; }
    .exp-item:nth-child(3) { animation-delay: 0.6s; }
    .exp-item:nth-child(1) { animation-delay: 0.9s; }

    @keyframes slideRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .skills-box {
    opacity: 0;
    transform: translateX(-50px);
    animation: slideRight 1s ease-out forwards;
    }

    .skills-box:nth-child(3) { animation-delay: 0.3s; }
    .skills-box:nth-child(2) { animation-delay: 0.6s; }
    .skills-box:nth-child(1) { animation-delay: 0.9s; }

    @keyframes slideRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .title-box {
    opacity: 0;
    transform: translateX(-50px);
    animation: slideRight 1s ease-out forwards;
    }

    
    .exp-item:nth-child(1) { animation-delay: 0.6s; }

    @keyframes slideRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

</style>
