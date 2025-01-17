import BondLogo from "../../components/BondLogo";
import { trim } from "../../helpers";
import { Box, Button, Link, Paper, Typography, TableRow, TableCell, SvgIcon, Slide } from "@material-ui/core";
import { ReactComponent as ArrowUp } from "../../assets/icons/arrow-up.svg";
import { NavLink } from "react-router-dom";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import useBonds from "src/hooks/Bonds";
import { useWeb3Context } from "../../hooks/web3Context";

export function BondDataCard({ bond }) {
  const { loading } = useBonds();
  const { chainID } = useWeb3Context();
  const isBondLoading = !bond.bondPrice ?? true;

  return (
    <Slide direction="up" in={true}>
      <Paper id={`${bond.name}--bond`} className="bond-data-card ohm-card">
        <div className="bond-pair">
          <BondLogo bond={bond} />
          <div className="bond-name">
            <Typography>{bond.displayName}</Typography>
            {bond.isLP && (
              <div>
                <Link href={bond.lpUrl} target="_blank">
                  <Typography variant="body1">
                    View Contract
                    <SvgIcon component={ArrowUp} htmlColor="#CCCCCC" />
                  </Typography>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="data-row">
          <Typography>Price</Typography>
          <Typography className="bond-price">
            <>{isBondLoading ? <Skeleton width="50px" /> : trim(bond.bondPrice, 2)}</>
          </Typography>
        </div>
        <div className="data-row">
          <Typography>ROI</Typography>
          <Typography>{isBondLoading ? <Skeleton width="50px" /> : `${trim(bond.bondDiscount * 100, 2)}%`}</Typography>
        </div>

        <div className="data-row">
          <Typography>Purchased</Typography>
          <Typography>
            {isBondLoading ? (
              <Skeleton width="80px" />
            ) : (
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
              }).format(bond.purchased)
            )}
          </Typography>
        </div>
        <Link component={NavLink} to={`/bonds/${bond.name}`}>
          <Button variant="outlined" color="primary" fullWidth disabled={!bond.isAvailable[chainID]}>
            <Typography variant="h5">{!bond.isAvailable[chainID] ? "Sold Out" : `Bond ${bond.displayName}`}</Typography>
          </Button>
        </Link>
      </Paper>
    </Slide>
  );
}

export function BondTableData({ bond }) {
  const { chainID } = useWeb3Context();
  // Use BondPrice as indicator of loading.
  const isBondLoading = !bond.bondPrice ?? true;
  // const isBondLoading = useSelector(state => !state.bonding[bond]?.bondPrice ?? true);
  const isSoldOut = bond.isSoldOut;
  const btnVarient = isSoldOut ? "contained" : "outlined";

  return (
    <TableRow id={`${bond.name}--bond`}>
      <TableCell align="left" className="bond-name-cell">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <Typography variant="body1">{bond.displayName}</Typography>
          {bond.isLP && (
            <Link color="primary" href={bond.lpUrl} target="_blank">
              <Typography variant="body1">
                View Contract
                <SvgIcon component={ArrowUp} htmlColor="#CCCCCC" />
              </Typography>
            </Link>
          )}
        </div>
      </TableCell>
      <TableCell align="left">
        <Typography>
          {isSoldOut ? (
            "--"
          ) : (
            <>
              <span className="currency-icon">$</span>
              {isBondLoading ? <Skeleton width="50px" /> : trim(bond.bondPrice, 2)}
            </>
          )}
        </Typography>
      </TableCell>
      <TableCell align="left">
        {isSoldOut ? "--" : <>{isBondLoading ? <Skeleton /> : `${trim(bond.bondDiscount * 100, 2)}%`}</>}
      </TableCell>
      <TableCell align="right">
        {isBondLoading ? (
          <Skeleton />
        ) : (
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          }).format(bond.purchased)
        )}
      </TableCell>
      <TableCell className="bond-button">
        {isSoldOut ? (
          <Button className="btn btn-white" color="primary" disabled={isSoldOut}>
            <Typography variant="h6">Sold Out</Typography>
          </Button>
        ) : (
          <Link component={NavLink} to={`/bonds/${bond.name}`}>
            <Button className="btn btn-white" color="primary">
              <Typography variant="h6">Bond</Typography>
            </Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
}
