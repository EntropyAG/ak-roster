import {
  Select,
  SelectChangeEvent
} from "@mui/material";
import { NextPage } from "next";
import { useState } from "react";
import { planify } from "../../../scripts/basemaker.mjs";
import Layout from "components/Layout";
import { Riic } from "types/riic";
import useOperators from "util/hooks/useOperators";

const Basemaker: NextPage = () => {
  const [promotionLevel, setPromotionLevel] = useState<0|1|2>(1);

  const [_roster] = useOperators();

  const planBase = () => {
    let base = new Riic(
      5,
      [
        { type: "PP",  level: 3, product: undefined },
        { type: "PP",  level: 3, product: undefined },
        { type: "TP",  level: 3, product: undefined },
        { type: "TP",  level: 2, product: undefined },
        { type: "FAC", level: 3, product: "gold" },
        { type: "FAC", level: 3, product: "exp" },
        { type: "FAC", level: 2, product: "gold" },
        { type: "FAC", level: 2, product: "gold" },
        { type: "FAC", level: 2, product: "exp" },
      ],
      [2,1,1,1], 3, 3, 3, 3
    );
    planify(_roster, base, true, promotionLevel);
  }

  const handlePromotionChange = (e: SelectChangeEvent<string>) => {
    setPromotionLevel(parseInt(e.target.value) as 0|1|2);
  };

  return (
    <Layout tab="/tools" page="/basemaker">
      <div className="menu">
        <fieldset>
          <legend>Planner</legend>
          <Select
             native
             size="small"
             label="Assume operators have a minimum promotion level?"
             inputProps={{
               name: "banner-type",
               id: "banner-type",
             }}
             onChange={handlePromotionChange}
           >
            <option value={0}>No</option>
            <option value={1} selected>Assume 4* and lower are maxed</option>
            <option value={2}>Assume all operators are maxed</option>
          </Select>
          <br className="clear" />

          <label htmlFor="nbFacGold">How many Factories should produce gold?</label>
          <input type="number" id="nbFacGold" min={0} max={5} defaultValue={0} />
          <br className="clear" />

          <label htmlFor="nbFacEXP">How many Factories should produce EXP?</label>
          <input type="number" id="nbFacEXP" min={0} max={5} defaultValue={0} />
          <br className="clear" />

          <label htmlFor="ppCount">Number of Power Plants</label>
          <input type="number" id="ppCount" min={1} max={3} defaultValue={2} />
          <br className="clear" />

          <label htmlFor="lvl3tp">Number of level 3 Trading Posts</label>
          <input type="number" id="lvl3tp" min={0} max={5} defaultValue={0} />
          <br className="clear" />

          <label htmlFor="lvl2tp">Number of level 2 Trading Posts</label>
          <input type="number" id="lvl2tp" min={0} max={5} defaultValue={0} />
          <br className="clear" />

          <label htmlFor="lvl3fac">Number of level 3 Factories</label>
          <input type="number" id="lvl3fac" min={0} max={5} defaultValue={0} />
          <br className="clear" />

          <label htmlFor="lvl2fac">Number of level 2 Factories</label>
          <input type="number" id="lvl2fac" min={0} max={5} defaultValue={0} />
          <br className="clear" />
          
          <label htmlFor="highestDorm">Highest dorm level</label>
          <input type="number" id="highestDorm" min={1} max={5} defaultValue={1} />
          <br className="clear" />

          <label htmlFor="lvlHR">Office (HR) level</label>
          <input type="number" id="lvlHR" min={1} max={3} defaultValue={1} />
          <br className="clear" />
        </fieldset>
        <button id="plan" onClick={planBase}>Plan my base</button>
      </div>
    </Layout>
  );
};
export default Basemaker;
