import "./style.scss";
import MiningImg from "./mining.png";
import { useSelector } from "react-redux";
import { trim, appLink } from "../../../../helpers";
import { Skeleton } from "@material-ui/lab";
import { Link } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import { allBondsMap } from "src/helpers/AllBonds";

export default function WelcomeSection() {
  const isAppLoading = useSelector(state => state.app.loading);
  const treasuryBalance = useSelector(state => {
    if (state.bonding.loading == false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances;
    }
  });

  const stakingAPY = useSelector(state => {
    return state.app.stakingAPY;
  });
  const trimmedStakingAPY = trim(stakingAPY * 100, 1);
  const stakingTVL = useSelector(state => {
    return state.app.stakingTVL;
  });
  const stakingRatio = useSelector(state => {
    return state.app.stakingRatio;
  });
  const trimmedStakingRatio = trim(stakingRatio * 100, 1);

  return (
    <section id="welcome">
      <div className="container">
        <div className="section-wrapper">
          <div>
            <h1>THE DECENTRALIZED RESERVE CURRENCY</h1>
            <p>
              AxeDAO is building a community-owned decentralized financial system to bring more stability and
              transparency for the world.
              <Link href={appLink("/stake")} target="_blank" className="mobile">
                <button className="btn btn-gradi">
                  <span>Enter App</span>
                </button>
              </Link>
            </p>
          </div>
          <ul>
            <li>
              <div>Total AXE Staked</div>
              <strong>
                {stakingRatio ? (
                  <>{new Intl.NumberFormat("en-US").format(Number(trimmedStakingRatio))}%</>
                ) : (
                  <Skeleton width="150px" />
                )}
              </strong>
            </li>
            <li>
              <div>Total Value Locked</div>
              <strong>
                {isAppLoading ? (
                  <Skeleton width="180px" />
                ) : (
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  }).format(stakingTVL)
                )}
              </strong>
            </li>
            <li>
              <div>Treasury Balance</div>
              <strong>
                {isAppLoading ? (
                  <Skeleton width="180px" />
                ) : (
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  }).format(treasuryBalance)
                )}
              </strong>
            </li>
            <li>
              <div>Current APY</div>
              <strong>
                {stakingAPY ? (
                  <>{new Intl.NumberFormat("en-US").format(Number(trimmedStakingAPY))}%</>
                ) : (
                  <Skeleton width="150px" />
                )}
              </strong>
            </li>
          </ul>
          <img className="mining-img" src={MiningImg} alt="axedao mining" />
        </div>
      </div>
    </section>
  );
}
