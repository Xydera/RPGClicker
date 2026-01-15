// src/components/HomeUI.jsx
import SharedFooter from "./SharedFooter"
import { Link } from 'react-router-dom';
import './../styles/App.css';
import './../styles/shared.css';
export default function HomeUI(){
    return(
        <>
            <div id="wrap">
                <div id="mainBox">
                    <div id="title">Xydera</div>
                    <div id="subtitle">Making games and stuff</div>

                    <div className="blurb">
                    <div className="block">
                        <h3>Welcome! I am Xydera</h3>
                        <p>My name is Luke and I'm an aspiring game developer. I make games in my free time and post them here for you to play!</p>
                        <p>Feel free to check out my games below, and if you like them, consider supporting me on <a href="https://www.patreon.com/xydera" target="_blank" rel="noreferrer">Patreon</a>!</p>
                        <p>I also have a <a href="https://discord.gg/ZruKemax54" target="_blank" rel="noreferrer">Discord</a>! Feel free to join the community.</p>
                    </div>
                    </div>

                    <div className="gameList">
                        <Link 
                            className="block whiteText" 
                            style={{ backgroundImage: "url('/assets/rpgClicker.png')" }} 
                            to="/rpgclicker"
                        >
                            <h3 className="gameTitle">RPGClicker</h3>
                            <p className="gameDesc">
                                An Idle RPG game where you fight monsters, upgrade your sword, and level up your stats!
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
            <SharedFooter />
        </>
    )
}