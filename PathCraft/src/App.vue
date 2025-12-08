<script setup lang="ts">

</script>

<template>
    <header>
        <div class="left-side">
            <h3>Portfolio de Romain</h3>
            <h3>Développeur Full Stack</h3>
        </div>
        <div class="social-link">
            <a href="https://github.com/sale-sify"><img src="./assets/images/github-logo.png" alt=""></a>
            <a href="https://www.linkedin.com/in/romainsales1/"><img src="./assets/images/linkedin-logo.png" alt=""></a>
        </div>
        <div class="right-side">
            <nav class="navigation">
                <router-link to="/">Acceuil</router-link>
                <router-link to="/about">Parcours</router-link>
                <router-link to="/projects">Projets</router-link>
                <router-link to="/contact">Contact</router-link>
            </nav>
        </div>
    </header>

    <div class="main-page">
        <router-view></router-view>
    </div>
    
    
</template>

<style scoped>

    header {
        display: flex;
        color: white;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: none;
        width: 100%;
        height: 10%;
        position: fixed;
    }

    .left-side {
        width: 30%;
        margin-left: 1%;
        font-size: 120%;
    }

    .social-link {
        display: flex;
        gap: 1rem;
        width: 7%;
        justify-content: center;
        align-items: center;
    }
    .social-link img {
        width: 100%;
        height: auto;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        background: none;
    }
    .social-link img:hover {
        transform: scale(1.2);
        background: none;
    }
    :deep(.social-link a),
    :deep(.social-link a:hover),
    :deep(.social-link a:focus),
    :deep(.social-link a:active) {
        background: transparent !important;
        outline: none !important;
        box-shadow: none !important;
    }



    .right-side {
        width: 70%;
        display: flex;
        justify-content: flex-end;
        margin-right: 10%;
    }

    .navigation a {
        margin-left: 2%;
        width: 100%;
        height: 80%;
        text-decoration: none;
        color: white;
        font-weight: bold;
        font-size: 1rem;
        padding: 10px;
        border-radius: 15px;
    }
    a:hover {
        background: #553d61e0;
    }


    

    footer {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 60px;
        font-style: italic;
        color: rgba(255, 255, 255, 0.76);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        position: fixed;
        bottom: 0;
        width: 100%;   
    }

    @media (max-width: 768px) {
        header {
            flex-direction: column;
            height: auto;
            padding: 15px 0;
            gap: 10px;
        }
        .left-side {
            display: none;
        }
        .social-link {
            width: 20%;
            gap: 0.5rem;
        }
        .right-side {
            margin-right: 5%;
        }
        .navigation a {
            font-size: 1rem;
            padding: 8px;
        }
    }
  
</style>
