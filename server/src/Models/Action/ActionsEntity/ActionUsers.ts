import generator from "generate-password";
import _ from "lodash";
import { Model, Document } from "mongoose";
import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import Utils from "../../../Utils";

const { getModelByName } = Utils;

class ActionUsers {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("users", "users");
        if (!model) return null;

        if (this.getEntity().getActionType() === "get_all") {
            return this.getEntity().getAll(model, actionParam);
        }

        if (this.getEntity().getActionType() === "recovory_checker") {
            const filed: string = (<Record<string, string>>actionParam).recovoryField;
            const mode: string = (<Record<string, string>>actionParam).mode;

            const props: object =
                mode == "emailMode"
                    ? {
                          email: filed
                      }
                    : { login: filed };

            const result: Record<string, any> | null = await this.getEntity().findOnce(model, { ...props });

            if (!result) return result;

            if (<Record<string, any>>result) {
                const { _id } = result || {};

                const password: string = generator.generate({
                    length: 10,
                    numbers: true
                });

                const passwordHash: string | null = await result.changePassword(password);

                if (!passwordHash) {
                    return null;
                }

                const res = await this.getEntity().updateEntity(model, { _id, updateProps: { passwordHash } });

                if (!res) return null;

                return <any>password;
            }
        }

        if (this.getEntity().getActionType() === "change_password") {
            const { queryParams = {} } = ({} = <Record<string, any>>actionParam);
            const { oldPassword = "", newPassword = "", uid = "" } = queryParams || {};

            const checkProps = {
                _id: uid
            };

            const result: Record<string, any> | null = await this.getEntity().findOnce(model, { ...checkProps });

            if (!result) {
                console.error("User not find for change password action");
                return null;
            }

            const isValid: boolean = await result.checkPassword(oldPassword);

            if (!isValid) {
                console.error("Bad old password for change password action");
                return null;
            }

            const { _id } = result || {};

            const password: string = newPassword;
            const passwordHash: string | null = await result.changePassword(password);

            if (!passwordHash) {
                return null;
            }

            const res = await this.getEntity().updateEntity(model, { _id, updateProps: { passwordHash } });

            if (!res) return null;

            return res;
        }

        if (this.getEntity().getActionType() === "common_changes") {
            const { queryParams = {} } = ({} = <Record<string, any>>actionParam);
            const { newEmail = "", newPhone = "", uid = "" } = queryParams || {};

            if (!uid || (!newEmail && !newPhone)) {
                return null;
            }

            const checkProps = {
                _id: uid
            };

            const result: Record<string, any> | null = await this.getEntity().findOnce(model, { ...checkProps });

            if (!result) {
                console.error("User not find for change password action");
                return null;
            }

            const { _id } = result || {};

            const email: string = newEmail ? newEmail : null;
            const phone: string = newPhone ? newPhone : null;

            const updateProps: Record<string, string> = {};

            if (!_.isNull(phone)) updateProps.phone = phone;
            if (!_.isNull(email)) updateProps.email = email;

            const res = await this.getEntity().updateEntity(model, { _id, updateProps });

            if (!res) return null;

            return res;
        }

        return null;
    }
}

export default ActionUsers;
