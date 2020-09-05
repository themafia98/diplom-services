const types = {
  /**
   * @readonly
   * @requires $path var with entity key
   *
   * Entrypoint type for any entity in application with entity key,
   * for example task card or news card,
   * if path include subModule with the same name '$$name$$',
   * it's virtual entity type and working how simple module with type
   * $entity_entrypoint
   *
   * path example: 'taskModule_all__entityKey'
   */
  $entity_entrypoint: Symbol.for('$entity_entrypoint'),
  /**
   * @readonly
   * @requires $link string var (entity key)
   * for building path to module
   *
   * Entrypoint type for links in application
   *
   * path example: 'taskModule_$link$__entityKey
   */
  $link_entrypoint: Symbol.for('$link_entrypoint'),
  /**
   * @readonly
   * @requires $path with sub module
   *
   * Entrypoint type for sub modules,
   * for example 'taskModule_all', where '_all' is a sub module
   *
   * path example: 'taskModule_all'
   */
  $sub_entrypoint_module: Symbol.for('$sub_entrypoint_module'),
  /**
   * @readonly
   * @requires $path
   *  Entrypoint for root modules
   *
   * path example: 'mainModule'
   */
  $entrypoint_module: Symbol.for('$entrypoint_module'),
};

export default types;
