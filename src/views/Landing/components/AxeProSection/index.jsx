import "./style.scss";
import AxeProImg from "./Safe.png";
import Audited from "src/components/Audited";
import { Link } from "@material-ui/core";
import { appLink } from "../../../../helpers";

export default function AxeProSection() {
  return (
    <section id="axe-pro">
      <div className="container">
        <div className="section-wrapper">
          <div className="card">
            <img className="axe-pro-img" src={AxeProImg} alt="" />
            <div className="card-wrapper">
              <h2>Introducing AxeDAO</h2>
              <p>
                AxeDAO is a fork of OlympusDAO. When the great OHM has successfully helped its investors made profit,
                and become more stable, the opportunities for new investors are significantly low. AxeDAO understands
                the market trends, therefore can offers the new opportunity for new investors into this protocol.
              </p>
              <Link component="button" className="btn btn-gradi" href={appLink("/stake")}>
                <span>View AxeDAO</span>
              </Link>
              <Audited />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
