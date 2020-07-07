'use strict';

const Effect = require('./effect');
const Modifier = require('./modifier');

class Policy {
  constructor(props) {
    Policy.validateProps(props);

    this.id = props.id;
    this.description = props.description || '';
    this.subjects = props.subjects;
    this.resources = props.resources;
    this.actions = props.actions;
    this.context = props.context;
    this.effect = props.effect;

    Object.seal(this);
  }

  static validateProps(props) {
    if (!props) {
      throw new Error('Policy requires a map of properties.');
    }

    if (!props.id) {
      throw new Error(
        'Policy requires a unique identifier. Did you set the "id" property?',
      );
    }

    if (!props.effect) {
      throw new Error(
        'Policy requires an effect. Did you set the "effect" property?',
      );
    }
    if (!(props.effect instanceof Effect)) {
      throw new Error(
        `Invalid effect: ${props.effect}. Valid effects are effects.ALLOW ` +
        `and effects.DENY.`,
      );
    }

    if (props.subjects) {
      if (!Array.isArray(props.subjects)) {
        throw new Error(
          `Invalid subjects: ${props.subjects}. Expected an array of ` +
          `modifiers.`,
        );
      }
      // Iterate over every subject.
      for (const subject of props.subjects) {
        Policy.recursivelyValidateRule(subject);
      }
    }

    if (props.resources) {
      if (!Array.isArray(props.resources)) {
        throw new Error(
          `Invalid resources: ${props.resources}. Expected an array of ` +
          `modifiers`,
        );
      }
      // Iterate over every resource.
      for (const resource of props.resources) {
        Policy.recursivelyValidateRule(resource);
      }
    }

    if (props.actions) {
      if (!Array.isArray(props.actions)) {
        throw new Error(
          `Invalid actions: ${props.actions}. Expected an array of ` +
          `modifiers`,
        );
      }
      // Iterate over every resource.
      for (const action of props.actions) {
        Policy.recursivelyValidateRule(action);
      }
    }

    if (props.context) {
      if (props.context.constructor !== Object) {
        throw new Error(
          `Invalid context: ${props.context}. Expected a map of keys and ` +
          `modifiers.`,
        );
      }
      // Validate the context.
      Policy.recursivelyValidateRule(props.context);
    }

    // Check for extraneous keys.
    for (const k of Object.keys(props)) {
      if (
        [
          'subjects',
          'resources',
          'context',
          'effect',
          'id',
          'description',
        ].indexOf(k) === -1
      ) {
        throw new Error(
          `Invalid policy attribute: ${k}. Valid attributes include ` +
          `"subjects", "resources", "context", "effect", "id", and ` +
          `"description".`,
        );
      }
    }
  }

  static recursivelyValidateRule(rule) {
    if (rule instanceof Modifier) return;
    if (rule.constructor !== Object) {
      throw new Error(
        `Invalid rule: ${rule}. Expected a key-value map or a single modifier.`,
      );
    }
    for (const v of Object.values(rule)) {
      Policy.recursivelyValidateRule(v);
    }
  }
}
