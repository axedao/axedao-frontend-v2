import "./style.scss"
import RocketIcon from './rocket.png';
import { useSelector } from 'react-redux';
import { Skeleton } from '@material-ui/lab';
import { allBondsMap } from "src/helpers/AllBonds";

export default function DifferentSection() {
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

  return (
    <section id="different">
      <div className="container">
        <div className="section-wrapper">
          <div>
            <h2>A true Store of Value doesn’r exist - yet</h2>
            <ul>
              <li>
                <p>
                  A Store of Value is an asset that is stable or increases in value over time.
                </p>
              </li>
              <li>
                <p>
                  Stablecoins are vulnerable to inflationary policies, while Bitcoin or
                  Ethereum suffer from market crashes or manipulation. None of these is a true Store of Value.
                </p>
              </li>
            </ul>
          </div>

          <div className="card">
            <ul>
              <li><h2>How is AxeDAO different?</h2></li>
              <li>
                <h3>AXE is designed to grow in value</h3>
                <p>
                  AXE is backed by an ever-growing, income-generating treasury.
                  We’ve created a currency that is able to constantly grow purchasing power despite market conditions.
                </p>
              </li>
            </ul>
            <div className="heading">
              <p>Treasury Value</p>
              <h2>
                {isAppLoading ? (
                  <Skeleton width="180px" />
                ) : (
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                  }).format(treasuryBalance)
                )}
              </h2>
            </div>
            <div className="inner-card">
              <img src={RocketIcon} className="rocket" />
              <div className="inner-card__wrapper"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
