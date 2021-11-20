import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as GitHub } from "../../assets/icons/github.svg";
import { ReactComponent as Medium } from "../../assets/icons/medium.svg";
import { ReactComponent as Twitter } from "../../assets/icons/twitter.svg";
import { ReactComponent as Docs } from "../../assets/icons/icon_doc.svg";
import { ReactComponent as Telegram } from '../../assets/icons/tele.svg';
import { ReactComponent as Discord } from '../../assets/icons/discord.svg';
import Audited from "../Audited";

export default function Social() {
  return (
    <div>
      <Audited />
      <div className="social-row">
        <Link href="https://github.com/AxeDAO" target="_blank">
          <SvgIcon color="primary" component={GitHub} />
        </Link>

        <Link href="https://t.me/Axe_Dao" target="_blank">
          <SvgIcon viewBox="0 0 40 35" component={Telegram} />
        </Link>

        <Link href="https://discord.gg/aPsrVWnuKG" target="_blank">
          <SvgIcon color="primary" component={Discord} />
        </Link>

        <Link href="https://twitter.com/AxeDao" target="_blank">
          <SvgIcon color="primary" component={Twitter} />
        </Link>

        <Link href="https://axedao.medium.com/" target="_blank">
          <SvgIcon color="primary" component={Medium} />
        </Link>

        <Link href="https://docs.axedao.finance/" target="_blank">
          <SvgIcon color="primary" component={Docs} />
        </Link>
      </div>
    </div>
  );
}
