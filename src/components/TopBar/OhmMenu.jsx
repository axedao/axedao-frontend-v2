import { useState, useEffect } from "react";
import { addresses, TOKEN_DECIMALS } from "../../constants";
import { useSelector } from "react-redux";
import { Link, SvgIcon, Popper, Button, Paper, Typography, Divider, Box, Fade, Slide } from "@material-ui/core";
import { ReactComponent as InfoIcon } from "../../assets/icons/info-fill.svg";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";

import { ReactComponent as sAXE } from "../../assets/tokens/sAXE.svg";
import { ReactComponent as AXE } from "../../assets/tokens/AXE.svg";

import "./ohmmenu.scss";
import { dai } from "src/helpers/AllBonds";
import { useWeb3Context } from "../../hooks/web3Context";
import token33tImg from "src/assets/tokens/token_33T.svg";

const addTokenToWallet = (tokenSymbol, tokenAddress) => async () => {
  if (window.ethereum) {
    const host = window.location.origin;
    // NOTE (appleseed): 33T token defaults to sOHM logo since we don't have a 33T logo yet
    let tokenPath;
    // if (tokenSymbol === "OHM") {

    // } ? OhmImg : SOhmImg;
    switch (tokenSymbol) {
      case "AXE":
        tokenPath = "https://res.cloudinary.com/dtzipaerg/image/upload/v1636643797/Group_1_1_nta8kg.png";
        break;
      case "33T":
        tokenPath = token33tImg;
        break;
      default:
        tokenPath = "https://res.cloudinary.com/dtzipaerg/image/upload/v1636893293/sAXE_o5iln9.png";
    }

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: TOKEN_DECIMALS,
            image: tokenPath,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

function OhmMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const isEthereumAPIAvailable = window.ethereum;
  const { chainID } = useWeb3Context();

  const networkID = chainID;

  const SAXE_ADDRESS = addresses[networkID].SAXE_ADDRESS;
  const AXE_ADDRESS = addresses[networkID].AXE_ADDRESS;
  const AXE_DAI_ADDRESS = addresses[networkID].AXE_DAI_LP;
  const PT_TOKEN_ADDRESS = addresses[networkID].PT_TOKEN_ADDRESS;

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = "ohm-popper";
  const daiAddress = dai.getAddressForReserve(networkID);
  return (
    <Box
      component="div"
      onMouseEnter={e => handleClick(e)}
      onMouseLeave={e => handleClick(e)}
      id="ohm-menu-button-hover"
    >
      <Button
        id="ohm-menu-button"
        className="btn btn-white"
        size="large"
        variant="contained"
        title="OHM"
        aria-describedby={id}
      >
        <SvgIcon component={InfoIcon} color="primary" />
        <Typography>BUY AXE</Typography>
      </Button>

      <Popper id={id} open={open} anchorEl={anchorEl} placement="bottom-start" transition>
        {({ TransitionProps }) => {
          return (
            <Fade {...TransitionProps} timeout={100}>
              <Paper className="ohm-menu" elevation={1}>
                <Box component="div" className="buy-tokens">
                  <Link
                    href={`https://app.uniswap.org/#/swap?inputCurrency=${daiAddress}&outputCurrency=${AXE_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Buy on Uniswap <SvgIcon component={ArrowUpIcon} htmlColor="#CCCCCC" />
                      </Typography>
                    </Button>
                  </Link>
                </Box>

                <Box component="div" className="data-links">
                  <Divider color="secondary" className="less-margin" />
                  <Link href={`https://www.dextools.io/app/ether/pair-explorer/${AXE_DAI_ADDRESS}`} target="_blank" rel="noreferrer">
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Chart on DexTools <SvgIcon component={ArrowUpIcon} htmlColor="#CCCCCC" />
                      </Typography>
                    </Button>
                  </Link>
                </Box>

                {/* <Box component="div" className="data-links">
                  <Divider color="secondary" className="less-margin" />
                  <Link href={`https://dune.xyz/shadow/Olympus-(OHM)`} target="_blank" rel="noreferrer">
                    <Button size="large" variant="contained" color="secondary" fullWidth>
                      <Typography align="left">
                        Shadow's Dune Dashboard <SvgIcon component={ArrowUpIcon} htmlColor="#CCCCCC" />
                      </Typography>
                    </Button>
                  </Link>
                </Box> */}

                {isEthereumAPIAvailable ? (
                  <Box className="add-tokens">
                    <Divider color="secondary" />
                    <p>ADD TOKEN TO WALLET</p>
                    <Box display="flex" flexDirection="row" justifyContent="space-between">
                      <Button variant="contained" color="secondary" onClick={addTokenToWallet("AXE", AXE_ADDRESS)}>
                        <SvgIcon component={AXE} viewBox="0 0 1555 1555" style={{ height: "25px", width: "25px" }} />
                        <Typography variant="body1">AXE</Typography>
                      </Button>
                      <Button variant="contained" color="secondary" onClick={addTokenToWallet("sAXE", SAXE_ADDRESS)}>
                        <SvgIcon component={sAXE} viewBox="0 0 734 734" style={{ height: "25px", width: "25px" }} />
                        <Typography variant="body1">sAXE</Typography>
                      </Button>
                      {/* <Button variant="contained" color="secondary" onClick={addTokenToWallet("33T", PT_TOKEN_ADDRESS)}>
                        <SvgIcon
                          component={t33TokenImg}
                          viewBox="0 0 1000 1000"
                          style={{ height: "25px", width: "25px" }}
                        />
                        <Typography variant="body1">33T</Typography>
                      </Button> */}
                    </Box>
                  </Box>
                ) : null}

                {/* <Divider color="secondary" />
                <Link
                  href="https://docs.olympusdao.finance/using-the-website/unstaking_lp"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="large" variant="contained" color="secondary" fullWidth>
                    <Typography align="left">Unstake Legacy LP Token</Typography>
                  </Button>
                </Link> */}
              </Paper>
            </Fade>
          );
        }}
      </Popper>
    </Box>
  );
}

export default OhmMenu;
