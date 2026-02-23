program ogvoe.aleo {

    mapping model_count: address => u64;
    mapping models_public: field => AIModelPublic;

    struct AIModelPublic {
        name: string,
        cid: string,
        total_uses: u64,
        active: bool,
    }

    record AIModel {
        owner: address,
        model_id: field,
        name: string,
        cid: string,
        total_uses: u64,
        active: bool,
        _nonce: u64,
    }

    transition list_model(
        name: string,
        cid: string
    ) -> AIModel {
        assert_neq(name, "");
        assert_neq(cid, "");

        let id: field = hash.bhp256(self.caller, block.height);

        let new_model: AIModel = AIModel {
            owner: self.caller,
            model_id: id,
            name: name,
            cid: cid,
            total_uses: 0u64,
            active: true,
            _nonce: 0u64
        };

        let public_view: AIModelPublic = AIModelPublic {
            name: name,
            cid: cid,
            total_uses: 0u64,
            active: true,
        };

        self.models_public.set(id, public_view);
        return new_model;
    }

    transition use_model(
        model_record: AIModel
    ) -> AIModel {
        assert_eq(model_record.owner, self.caller);
        assert_eq(model_record.active, true);

        let updated_uses: u64 = model_record.total_uses + 1u64;

        let updated_model: AIModel = AIModel {
            owner: model_record.owner,
            model_id: model_record.model_id,
            name: model_record.name,
            cid: model_record.cid,
            total_uses: updated_uses,
            active: model_record.active,
            _nonce: model_record._nonce + 1u64
        };

        let public_view: AIModelPublic = AIModelPublic {
            name: model_record.name,
            cid: model_record.cid,
            total_uses: updated_uses,
            active: model_record.active,
        };

        self.models_public.set(model_record.model_id, public_view);
        return updated_model;
    }

    transition deactivate_model(
        model_record: AIModel
    ) -> AIModel {
        assert_eq(model_record.owner, self.caller);

        let deactivated: AIModel = AIModel {
            owner: model_record.owner,
            model_id: model_record.model_id,
            name: model_record.name,
            cid: model_record.cid,
            total_uses: model_record.total_uses,
            active: false,
            _nonce: model_record._nonce + 1u64
        };

        let public_view: AIModelPublic = AIModelPublic {
            name: model_record.name,
            cid: model_record.cid,
            total_uses: model_record.total_uses,
            active: false,
        };

        self.models_public.set(model_record.model_id, public_view);
        return deactivated;
    }

    transition get_model_public(
        model_id: field
    ) -> AIModelPublic {
        return self.models_public.get(model_id);
    }
}