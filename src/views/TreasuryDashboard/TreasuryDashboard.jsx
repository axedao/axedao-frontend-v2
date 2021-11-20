import { useEffect, useState } from "react";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import Chart from "../../components/Chart/Chart.jsx";
import { trim, formatCurrency } from "../../helpers";
import {
  treasuryDataQuery,
  rebasesDataQuery,
  bulletpoints,
  tooltipItems,
  tooltipInfoMessages,
  itemType,
} from "./treasuryData.js";
import { useTheme } from "@material-ui/core/styles";
import "./treasury-dashboard.scss";
import apollo from "../../lib/apolloClient";
import InfoTooltip from "src/components/InfoTooltip/InfoTooltip.jsx";
import { allBondsMap } from "src/helpers/AllBonds";
import DashboardIcon from "./dashboard-icon.png";

const percentFormatter = Intl.NumberFormat('en', { style: 'percent', minimumFractionDigits: 2 });

function TreasuryDashboard() {
  const [data, setData] = useState(null);
  const [apy, setApy] = useState(null);
  const [runway, setRunway] = useState(null);
  const [staked, setStaked] = useState(null);
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");

  const marketPrice = useSelector(state => {
    return state.app.marketPrice;
  });
  const circSupply = useSelector(state => {
    return state.app.circSupply;
  });
  const totalSupply = useSelector(state => {
    return state.app.totalSupply;
  });
  const marketCap = useSelector(state => {
    return state.app.marketCap;
  });

  const currentIndex = useSelector(state => {
    return state.app.currentIndex;
  });

  const runwayValue = useSelector(state => {
    return state.app.runway;
  });

  const backingPerOhm = useSelector(state => {
    if (state.bonding.loading == false) {
      let tokenBalances = 0;
      for (const bond in allBondsMap) {
        if (state.bonding[bond]) {
          tokenBalances += state.bonding[bond].purchased;
        }
      }
      return tokenBalances / state.app.circSupply;
    }
  });

  const pol = useSelector(state => state.app.pol);
  const stakingTVL = useSelector(state => state.app.stakingTVL);
  const stakingRatio = useSelector(state => state.app.stakingRatio);
  const stakingAPY = useSelector(state => state.app.stakingAPY);

  const wsOhmPrice = useSelector(state => {
    return state.app.marketPrice * state.app.currentIndex;
  });

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
    <div id="treasury-dashboard-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "3.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "3.3rem",
        }}
      >
        <Box className={`hero-metrics`}>
          <Paper className="ohm-card">
            <div className="hero">
              <div>
                <h3>
                  Wen (3,3) becomes ({String.fromCodePoint(0x1fa93)}, {String.fromCodePoint(0x1fa93)})
                </h3>
                <h1>
                  Welcome to <span className="mark-gradient-text">AxeDAO</span>
                </h1>
                <p>The Decentralized Reserve Currency</p>
              </div>
              <img src={DashboardIcon} />
            </div>
            <Box
              className="ohm-card-content"
              display="flex"
              flexWrap="wrap"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box className="metric market">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Market Cap
                  </Typography>
                  <Typography variant="h5">
                    {marketCap && formatCurrency(marketCap, 0)}
                    {!marketCap && <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric market">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Treasury Balance
                    <InfoTooltip
                      message={
                        "Market Value of Treasury Assets, is the sum of the value (in dollars) of all assets held by the treasury."
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {treasuryBalance && formatCurrency(treasuryBalance, 0)}
                    {!treasuryBalance && <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric circ">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Circulating Supply (total)
                  </Typography>
                  <Typography variant="h5">
                    {circSupply && totalSupply ? (
                      parseInt(circSupply) + " / " + parseInt(totalSupply)
                    ) : (
                      <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />
                    )}
                  </Typography>
                </div>
              </Box>

              <Box className="metric price">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    AXE Price
                  </Typography>
                  <Typography variant="h5">
                    {/* appleseed-fix */}
                    {marketPrice ? formatCurrency(marketPrice, 2) : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric wsoprice">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    wsAXE Price
                    <InfoTooltip
                      message={
                        "wsAXE = sAXE * index\n\nThe price of wsAXE is equal to the price of AXE multiplied by the current index"
                      }
                    />
                  </Typography>

                  <Typography variant="h5">
                    {wsOhmPrice ? formatCurrency(wsOhmPrice, 2) : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric bpo">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Backing per AXE
                  </Typography>
                  <Typography variant="h5">
                    {backingPerOhm ? (
                      formatCurrency(backingPerOhm, 2)
                    ) : (
                      <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />
                    )}
                  </Typography>
                </div>
              </Box>

              <Box className="metric runway">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Staking APY
                    <InfoTooltip
                      message={
                        "Annual Percentage Yield, is the normalized representation of an interest rate, based on a compounding period over one year. Note that APYs provided are rather ballpark level indicators and not so much precise future results."
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {stakingAPY ? percentFormatter.format(stakingAPY) : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric runway">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Staking Ratio
                    <InfoTooltip
                      message={
                        "AXE Staked, is the ratio of sAXE to AXE (staked vs unstaked)"
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {stakingRatio ? percentFormatter.format(stakingRatio) : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>
              
              <Box className="metric runway">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Staking TVL
                    <InfoTooltip
                      message={
                        "Total Value Deposited, is the dollar amount of all AXE staked in the protocol. This metric is often used as growth or health indicator in DeFi projects."
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {stakingTVL ? formatCurrency(stakingTVL, 2) : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>
              
              <Box className="metric runway">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Protocol Own Liquidity
                    <InfoTooltip
                      message={
                        "Protocol Owned Liquidity, is the amount of LP the treasury owns and controls. The more POL the better for the protocol and its users."
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {pol ? percentFormatter.format(pol) : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric index">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Current Index
                    <InfoTooltip
                      message={
                        "The current index tracks the amount of sAXE accumulated since the beginning of staking. Basically, how much sAXE one would have if they staked and held a single AXE from day 1."
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {currentIndex ? trim(currentIndex, 2) + " sAXE" : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>

              <Box className="metric runway">
                <div className="card-item">
                  <Typography variant="body2" component={"span"} color="textSecondary">
                    Runway
                    <InfoTooltip
                      message={
                        "Runway, is the number of days sAXE emissions can be sustained at a given rate. Lower APY = longer runway"
                      }
                    />
                  </Typography>
                  <Typography variant="h5">
                    {runwayValue ? trim(runwayValue, 0) + " days" : <Skeleton type="text" sx={{ bgcolor: "#ccc" }} />}
                  </Typography>
                </div>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
}

export default TreasuryDashboard;
