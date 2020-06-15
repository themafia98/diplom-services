const types = Object.freeze({
  /**
   * @readonly
   * @requires $path var with entity key
   *
   * Entrypoint type for any entity in application with entity key,
   * for example task card or news card
   */
  $entity_entrypoint: Symbol.for('$entity_entrypoint'),
  /**
   * @readonly
   * @requires $link string var (entity key)
   *
   * Entrypoint type for links in application
   */
  $link_entrypoint: Symbol.for('$link_entrypoint'),
  /**
   * @readonly
   * @requires $path with sub module
   *
   * Entrypoint type for sub modules,
   * for example 'TaskModule_all', where '_all' is a sub module
   */
  $sub_entrypoint_module: Symbol.for('$sub_entrypoint_module'),
  /**
   * @readonly
   * @requires $path
   *  Entrypoint for root modules, for example mainModule
   */
  $entrypoint_module: Symbol.for('$entrypoint_module'),
});

export default types;
