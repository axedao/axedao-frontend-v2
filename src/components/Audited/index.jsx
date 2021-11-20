import {  Link } from '@material-ui/core';
// 
import CertikLogo from "../../assets/images/certik-logo.svg"
import SolidProofLogo from "../../assets/images/SolidProof.png"
import TechRateLogo from "../../assets/images/TechRate.png"

export default function Audited() {
  return (
      <div className="audited-group">
        <hr />
        <h3>Secured by</h3>
        <div>
          <Link href="#">
            <img className="none-audit" src={SolidProofLogo}/>
          </Link>
          <Link href="https://github.com/TechRate/Smart-Contract-Audits/blob/main/November/AxeDAO.pdf" target="_blank">
            <img src={TechRateLogo}/>
          </Link>
        </div>
      </div>
  );
}
