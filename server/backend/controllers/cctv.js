import CCTVService from "../services/cctv";

const create = async (req, res, next) => {
  const { center_id, cctv_name, cctv_mac, install_date, quality } = req.body;

  try {
    const cctv = await CCTVService.create(
      center_id,
      cctv_name,
      cctv_mac,
      install_date,
      quality
    );
    res.status(201).json(cctv);
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      res.status(409).send("Duplicate cctv_mac value.");
    }
    console.error(err);
    next(err);
  }
};

const findByCenterId = async (req, res, next) => {
  try {
    const { center_id } = req.query;
    const cctv = await CCTVService.findByCenterId(center_id);
    res.json(cctv);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const updateByCctvMac = async (req, res, next) => {
  try {
    const { cctv_name, install_date, uninstall_date, quality } = req.body;
    const cctv = CCTVService.updateByCctvMac(
      req.params.cctv_mac,
      cctv_name,
      install_date,
      uninstall_date,
      quality
    );
    res.json(cctv);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteByCctvMac = async (req, res, next) => {
  try {
    CCTVService.deleteByCctvMac(req.params.cctv_mac);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export default { create, findByCenterId, updateByCctvMac, deleteByCctvMac };
