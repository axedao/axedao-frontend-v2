import './landing.scss';
import { useState } from 'react';
import Header from './components/Header';
import { Backdrop } from '@material-ui/core';
import Footer from './components/Footer';
import CloseIcon from './images/icon_24x24_close.svg';
// import WhiteList from '../WhiteList';


//
import WelcomeSection from "./components/WelcomeSection" 
import AxeProSection from "./components/AxeProSection" 
import HowWorksSection from "./components/HowWorksSection" 
import StakingSection from "./components/StakingSection" 
import DifferentSection from "./components/DifferentSection" 
import LiquiditySection from "./components/LiquiditySection" 
import JoinCommunitySection from "./components/JoinCommunitySection" 
// 


function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div className="landing-page">
      <Header />
      <WelcomeSection/>
      <AxeProSection/>
      <HowWorksSection/>
      <StakingSection/>
      <DifferentSection/>
      <LiquiditySection/>
      <JoinCommunitySection/>
      <Footer />
      <Backdrop open={open} className="whitelist-check">
        <div className="whitelist-container">
          {/* <WhiteList /> */}
          <div className="close-modal-button" onClick={() => setOpen(false)}>
            <img src={CloseIcon} />
          </div>
        </div>
      </Backdrop>
    </div>
  );
}

export default Landing;
