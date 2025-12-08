
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35731/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                if (!is_function(callback)) {
                    return noop;
                }
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }

    /* src\SvelteWidget.svelte generated by Svelte v3.59.2 */
    const file = "src\\SvelteWidget.svelte";

    // (92:0) {#if config && config.showButton === true}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Set data to 'Testing 123'";
    			add_location(button, file, 92, 4, 2755);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[8], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(92:0) {#if config && config.showButton === true}",
    		ctx
    	});

    	return block;
    }

    // (96:0) {#if config && config.showDebug === true}
    function create_if_block(ctx) {
    	let h1;
    	let t1;
    	let ul;
    	let li0;
    	let t2;
    	let t3;
    	let t4;
    	let li1;
    	let t5;
    	let t6_value = JSON.stringify(/*inputData*/ ctx[0]) + "";
    	let t6;
    	let t7;
    	let li2;
    	let t8;
    	let br0;
    	let pre0;
    	let t9_value = JSON.stringify(/*config*/ ctx[1], null, 2) + "";
    	let t9;
    	let t10;
    	let li3;
    	let t11;
    	let br1;
    	let pre1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Debug information (inside widget)";
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t2 = text("use default data: ");
    			t3 = text(/*useDefaultData*/ ctx[2]);
    			t4 = space();
    			li1 = element("li");
    			t5 = text("inputData as JSON: ");
    			t6 = text(t6_value);
    			t7 = space();
    			li2 = element("li");
    			t8 = text("config as JSON: ");
    			br0 = element("br");
    			pre0 = element("pre");
    			t9 = text(t9_value);
    			t10 = space();
    			li3 = element("li");
    			t11 = text("descriptor as JSON: ");
    			br1 = element("br");
    			pre1 = element("pre");
    			pre1.textContent = `${JSON.stringify(/*descriptor*/ ctx[3], null, 2)}`;
    			add_location(h1, file, 96, 0, 2895);
    			add_location(li0, file, 98, 4, 2949);
    			add_location(li1, file, 99, 4, 2998);
    			add_location(br0, file, 100, 24, 3079);
    			add_location(pre0, file, 100, 28, 3083);
    			add_location(li2, file, 100, 4, 3059);
    			add_location(br1, file, 101, 28, 3162);
    			add_location(pre1, file, 101, 32, 3166);
    			add_location(li3, file, 101, 4, 3138);
    			add_location(ul, file, 97, 0, 2939);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t2);
    			append_dev(li0, t3);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, t5);
    			append_dev(li1, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, t8);
    			append_dev(li2, br0);
    			append_dev(li2, pre0);
    			append_dev(pre0, t9);
    			append_dev(ul, t10);
    			append_dev(ul, li3);
    			append_dev(li3, t11);
    			append_dev(li3, br1);
    			append_dev(li3, pre1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*useDefaultData*/ 4) set_data_dev(t3, /*useDefaultData*/ ctx[2]);
    			if (dirty & /*inputData*/ 1 && t6_value !== (t6_value = JSON.stringify(/*inputData*/ ctx[0]) + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*config*/ 2 && t9_value !== (t9_value = JSON.stringify(/*config*/ ctx[1], null, 2) + "")) set_data_dev(t9, t9_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(96:0) {#if config && config.showDebug === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let t2;
    	let input;
    	let t3;
    	let br2;
    	let t4;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let t9;
    	let mounted;
    	let dispose;
    	let if_block0 = /*config*/ ctx[1] && /*config*/ ctx[1].showButton === true && create_if_block_1(ctx);
    	let if_block1 = /*config*/ ctx[1] && /*config*/ ctx[1].showDebug === true && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("This is a widget example. ");
    			br0 = element("br");
    			t1 = text("\r\nHere you see input data that is also used as output data:");
    			br1 = element("br");
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			br2 = element("br");
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "Emit data";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Reverse and then emit data";
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			if (if_block1) if_block1.c();
    			this.c = noop;
    			add_location(br0, file, 84, 26, 2478);
    			add_location(br1, file, 85, 57, 2541);
    			add_location(input, file, 86, 0, 2547);
    			add_location(br2, file, 86, 31, 2578);
    			add_location(button0, file, 88, 0, 2586);
    			add_location(button1, file, 89, 0, 2634);
    			add_location(div, file, 82, 0, 2419);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, br0);
    			append_dev(div, t1);
    			append_dev(div, br1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			set_input_value(input, /*inputData*/ ctx[0]);
    			append_dev(div, t3);
    			append_dev(div, br2);
    			append_dev(div, t4);
    			append_dev(div, button0);
    			append_dev(div, t6);
    			append_dev(div, button1);
    			append_dev(div, t8);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t9);
    			if (if_block1) if_block1.m(div, null);
    			/*div_binding*/ ctx[9](div);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[7]),
    					listen_dev(button0, "click", /*emitData*/ ctx[5], false, false, false, false),
    					listen_dev(button1, "click", /*reverseAndEmit*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*inputData*/ 1 && input.value !== /*inputData*/ ctx[0]) {
    				set_input_value(input, /*inputData*/ ctx[0]);
    			}

    			if (/*config*/ ctx[1] && /*config*/ ctx[1].showButton === true) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div, t9);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*config*/ ctx[1] && /*config*/ ctx[1].showDebug === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*div_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('svelte-widget', slots, []);
    	let { config = { showButton: true, showDebug: false } } = $$props;
    	let { useDefaultData = true } = $$props;

    	const descriptor = {
    		valueModel: { type: 'string' },
    		configuration: {
    			showButton: {
    				type: 'boolean',
    				defaultValue: true,
    				metadata: {
    					title: 'Shows the (p)reset button on the widget (or not)'
    				}
    			},
    			showDebug: {
    				type: 'boolean',
    				defaultValue: false,
    				metadata: {
    					title: 'Shows the debug information inside the widget (or not)'
    				}
    			}
    		}
    	};

    	let { inputData } = $$props; //Does the naming here make a difference?

    	/**
     * The host element of the widget.
     * @type {HTMLElement}
     */
    	let hostElement;

    	onMount(() => {
    		// When the component is first mounted, emit the initial data.
    		// This is done in onMount to ensure the hostElement is bound and
    		// the event listener on the host page has had a chance to be attached.
    		emitData();
    	});

    	function emitData() {
    		if (!hostElement) return;

    		// Dispatch a standard DOM CustomEvent that can bubble up and cross the shadow DOM boundary.
    		hostElement.dispatchEvent(new CustomEvent('message',
    		{
    				detail: { inputData }, //Does the naming here make a difference?
    				bubbles: true,
    				composed: true
    			}));
    	}

    	function reverseAndEmit() {
    		// Ensure inputData is treated as a string for reversal
    		const stringValue = String(inputData);

    		// Reverse the string and update outputData.
    		$$invalidate(0, inputData = stringValue.split('').reverse().join(''));

    		// Explicitly emit the change
    		emitData();
    	}

    	$$self.$$.on_mount.push(function () {
    		if (inputData === undefined && !('inputData' in $$props || $$self.$$.bound[$$self.$$.props['inputData']])) {
    			console.warn("<svelte-widget> was created without expected prop 'inputData'");
    		}
    	});

    	const writable_props = ['config', 'useDefaultData', 'inputData'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<svelte-widget> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputData = this.value;
    		($$invalidate(0, inputData), $$invalidate(2, useDefaultData));
    	}

    	const click_handler = () => {
    		$$invalidate(0, inputData = "Testing 123");
    	};

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			hostElement = $$value;
    			$$invalidate(4, hostElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('config' in $$props) $$invalidate(1, config = $$props.config);
    		if ('useDefaultData' in $$props) $$invalidate(2, useDefaultData = $$props.useDefaultData);
    		if ('inputData' in $$props) $$invalidate(0, inputData = $$props.inputData);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		config,
    		useDefaultData,
    		descriptor,
    		inputData,
    		hostElement,
    		emitData,
    		reverseAndEmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('config' in $$props) $$invalidate(1, config = $$props.config);
    		if ('useDefaultData' in $$props) $$invalidate(2, useDefaultData = $$props.useDefaultData);
    		if ('inputData' in $$props) $$invalidate(0, inputData = $$props.inputData);
    		if ('hostElement' in $$props) $$invalidate(4, hostElement = $$props.hostElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*useDefaultData, inputData*/ 5) {
    			$$invalidate(0, inputData = useDefaultData !== false
    			? "This is a default value"
    			: inputData);
    		}
    	};

    	return [
    		inputData,
    		config,
    		useDefaultData,
    		descriptor,
    		hostElement,
    		emitData,
    		reverseAndEmit,
    		input_input_handler,
    		click_handler,
    		div_binding
    	];
    }

    class SvelteWidget extends SvelteElement {
    	constructor(options) {
    		super();

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				config: 1,
    				useDefaultData: 2,
    				descriptor: 3,
    				inputData: 0
    			},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert_dev(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["config", "useDefaultData", "descriptor", "inputData"];
    	}

    	get config() {
    		return this.$$.ctx[1];
    	}

    	set config(config) {
    		this.$$set({ config });
    		flush();
    	}

    	get useDefaultData() {
    		return this.$$.ctx[2];
    	}

    	set useDefaultData(useDefaultData) {
    		this.$$set({ useDefaultData });
    		flush();
    	}

    	get descriptor() {
    		return this.$$.ctx[3];
    	}

    	set descriptor(value) {
    		throw new Error("<svelte-widget>: Cannot set read-only property 'descriptor'");
    	}

    	get inputData() {
    		return this.$$.ctx[0];
    	}

    	set inputData(inputData) {
    		this.$$set({ inputData });
    		flush();
    	}
    }

    customElements.define("svelte-widget", SvelteWidget);

    return SvelteWidget;

})();
//# sourceMappingURL=SvelteWidget.js.map
